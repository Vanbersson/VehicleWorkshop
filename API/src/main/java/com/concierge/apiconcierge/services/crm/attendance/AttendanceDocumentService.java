package com.concierge.apiconcierge.services.crm.attendance;

import com.concierge.apiconcierge.dtos.crm.attendance.AttendanceDocumentDto;
import com.concierge.apiconcierge.models.crm.attendance.*;
import com.concierge.apiconcierge.repositories.crm.attendance.*;
import com.concierge.apiconcierge.exceptions.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class AttendanceDocumentService {
    private final CustomerAttendanceService attendances;
    private final ICustomerAttendanceRepository attendanceRepository;
    private final IAttendanceDocumentRepository documents;
    private final AttendanceDocumentStorage storage;

    public AttendanceDocumentService(CustomerAttendanceService attendances, ICustomerAttendanceRepository attendanceRepository, IAttendanceDocumentRepository documents, AttendanceDocumentStorage storage) {
        this.attendances = attendances;
        this.attendanceRepository = attendanceRepository;
        this.documents = documents;
        this.storage = storage;
    }

    @Transactional(readOnly = true)
    public List<AttendanceDocumentDto> list(Integer attendanceId, String email) {
        attendances.authorizedAttendance(attendanceId, email);
        return documents.listMetadata(attendanceId);
    }

    @Transactional(rollbackFor = IOException.class)
    public AttendanceDocumentDto upload(Integer attendanceId, MultipartFile file, String email) throws IOException {
        CustomerAttendance scope = attendances.authorizedAttendance(attendanceId, email);
        CustomerAttendance attendance = attendanceRepository.findForQuote(scope.getCompanyId(), scope.getResaleId(), attendanceId);
        if (attendance == null) throw new ResourcesNotFoundException("Atendimento não encontrado.");
        if (attendance.getStatus() == AttendanceStatus.CANCELLED)
            throw new BusinessException("O atendimento cancelado permite apenas consultar documentos.");
        if (file.isEmpty() || file.getSize() > 5L * 1024 * 1024)
            throw new BusinessException("Selecione um arquivo de até 5 MB.");
        byte[] content = file.getBytes();
        String mime = detectType(content);
        String raw = Optional.ofNullable(file.getOriginalFilename()).orElse("documento").replace('\\', '/');
        String name = raw.substring(raw.lastIndexOf('/') + 1).replaceAll("[\\p{Cntrl}]", "").trim();
        if (name.isEmpty() || name.length() > 255) throw new BusinessException("Nome de arquivo inválido.");
        String extension = name.contains(".") ? name.substring(name.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT) : "";
        boolean valid = (mime.equals("application/pdf") && extension.equals("pdf")) || (mime.equals("image/png") && extension.equals("png")) || (mime.equals("image/jpeg") && (extension.equals("jpg") || extension.equals("jpeg"))) || (mime.equals("image/webp") && extension.equals("webp"));
        if (!valid) throw new BusinessException("Envie um PDF ou uma imagem JPG, PNG ou WebP válida.");
        AttendanceDocument document = new AttendanceDocument();
        document.setAttendanceId(attendanceId);
        document.setFileName(name);
        document.setContentType(mime);
        document.setSize((long) content.length);
        document.setCreatedAt(new Date());
        document.setFilePath(storage.save(scope.getCompanyId(), scope.getResaleId(), attendanceId, extension, content));
        String filePath = document.getFilePath();
        if (org.springframework.transaction.support.TransactionSynchronizationManager.isSynchronizationActive()) {
            org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(new org.springframework.transaction.support.TransactionSynchronization() {
                @Override
                public void afterCompletion(int status) {
                    if (status == STATUS_ROLLED_BACK) try {
                        storage.delete(filePath);
                    } catch (IOException error) {
                        org.slf4j.LoggerFactory.getLogger(AttendanceDocumentService.class).error("Could not remove rolled-back attendance document {}", filePath, error);
                    }
                }
            });
        }
        try {
            document = documents.saveAndFlush(document);
        } catch (RuntimeException error) {
            try {
                storage.delete(filePath);
            } catch (IOException cleanup) {
                error.addSuppressed(cleanup);
            }
            throw error;
        }
        return new AttendanceDocumentDto(document.getId(), document.getFileName(), document.getContentType(), document.getSize(), document.getCreatedAt());
    }

    public record Download(AttendanceDocument document, byte[] content) {
    }

    @Transactional(readOnly = true)
    public Download download(Integer attendanceId, Integer documentId, String email) throws IOException {
        attendances.authorizedAttendance(attendanceId, email);
        AttendanceDocument document = documents.findByAttendanceIdAndId(attendanceId, documentId).orElseThrow(() -> new ResourcesNotFoundException("Documento não encontrado neste atendimento."));
        return new Download(document, storage.read(document.getFilePath()));
    }

    private String detectType(byte[] data) {
        if (data.length >= 8 && Arrays.equals(Arrays.copyOf(data, 8), new byte[]{(byte) 137, 80, 78, 71, 13, 10, 26, 10}))
            return "image/png";
        if (data.length >= 3 && (data[0] & 255) == 255 && (data[1] & 255) == 216 && (data[2] & 255) == 255)
            return "image/jpeg";
        if (data.length >= 12 && new String(data, 0, 4, StandardCharsets.US_ASCII).equals("RIFF") && new String(data, 8, 4, StandardCharsets.US_ASCII).equals("WEBP"))
            return "image/webp";
        if (data.length >= 5 && new String(data, 0, 5, StandardCharsets.US_ASCII).equals("%PDF-"))
            return "application/pdf";
        throw new BusinessException("Formato não permitido. Envie PDF, JPG, PNG ou WebP.");
    }
}
