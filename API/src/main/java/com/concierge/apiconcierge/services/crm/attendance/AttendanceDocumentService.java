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
    private final IAttendanceLogRepository logs;
    private final com.concierge.apiconcierge.repositories.user.IUserRepository users;

    public AttendanceDocumentService(CustomerAttendanceService attendances, ICustomerAttendanceRepository attendanceRepository, IAttendanceDocumentRepository documents, AttendanceDocumentStorage storage, com.concierge.apiconcierge.repositories.user.IUserRepository users, IAttendanceLogRepository logs) {
        this.attendances = attendances;
        this.attendanceRepository = attendanceRepository;
        this.documents = documents;
        this.storage = storage;
        this.users = users;
        this.logs = logs;
    }

    @Transactional(readOnly = true)
    public List<AttendanceDocumentDto> list(Integer attendanceId, String email) {
        return list(attendanceId, AttendanceDocumentStage.DOCUMENTS, email);
    }

    @Transactional(readOnly = true)
    public List<AttendanceDocumentDto> list(Integer attendanceId, AttendanceDocumentStage stage, String email) {
        attendances.authorizedAttendance(attendanceId, email);
        return documents.listMetadata(attendanceId, Objects.requireNonNull(stage));
    }

    @Transactional(rollbackFor = IOException.class)
    public AttendanceDocumentDto upload(Integer attendanceId, MultipartFile file, String email) throws IOException {
        return upload(attendanceId, file, AttendanceDocumentStage.DOCUMENTS, email);
    }

    @Transactional(rollbackFor = IOException.class)
    public AttendanceDocumentDto upload(Integer attendanceId, MultipartFile file, AttendanceDocumentStage stage, String email) throws IOException {
        return upload(attendanceId,file,stage,null,email);
    }

    @Transactional(rollbackFor = IOException.class)
    public AttendanceDocumentDto upload(Integer attendanceId, MultipartFile file, AttendanceDocumentStage stage, java.math.BigDecimal receiptAmount, String email) throws IOException {
        Objects.requireNonNull(stage);
        CustomerAttendance scope = attendances.authorizedAttendance(attendanceId, email);
        CustomerAttendance attendance = attendanceRepository.findForQuote(scope.getCompanyId(), scope.getResaleId(), attendanceId);
        if (attendance == null) throw new ResourcesNotFoundException("Atendimento não encontrado.");
        if (attendance.getStatus() == AttendanceStatus.COMPLETED) throw new BusinessException("O atendimento concluído está disponível apenas para consulta.");
        if (attendance.getStatus() == AttendanceStatus.CANCELLED)
            throw new BusinessException("O atendimento cancelado permite apenas consultar documentos.");
        if (stage != AttendanceDocumentStage.PAYMENT && stage != AttendanceDocumentStage.INVOICING && documents.findFirstByAttendanceIdAndStage(attendanceId, stage).isPresent())
            throw new BusinessException("Esta etapa permite apenas um documento. Remova o arquivo atual antes de adicionar outro.");
        if (stage == AttendanceDocumentStage.PAYMENT || stage == AttendanceDocumentStage.INVOICING) validateReceiptAmount(receiptAmount);
        if (file.isEmpty() || file.getSize() > 5L * 1024 * 1024)
            throw new BusinessException("Selecione um arquivo de até 5 MB.");
        byte[] content = file.getBytes();
        String mime = detectType(content);
        String raw = Optional.ofNullable(file.getOriginalFilename()).orElse("documento").replace('\\', '/');
        String name = raw.substring(raw.lastIndexOf('/') + 1).replaceAll("[\\p{Cntrl}]", "").trim();
        if (name.isEmpty() || name.length() > 255) throw new BusinessException("Nome de arquivo inválido.");
        String extension = name.contains(".") ? name.substring(name.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT) : "";
        if(stage != AttendanceDocumentStage.PAYMENT && stage != AttendanceDocumentStage.DELIVERY && (!mime.equals("application/pdf") || !extension.equals("pdf")))
            throw new BusinessException("Esta etapa aceita apenas arquivos PDF.");
        boolean valid = (mime.equals("application/pdf") && extension.equals("pdf")) || (mime.equals("image/png") && extension.equals("png")) || (mime.equals("image/jpeg") && (extension.equals("jpg") || extension.equals("jpeg"))) || (mime.equals("image/webp") && extension.equals("webp"));
        if (!valid) throw new BusinessException("Envie um PDF ou uma imagem JPG, PNG ou WebP válida.");
        AttendanceDocument document = new AttendanceDocument();
        if (stage == AttendanceDocumentStage.PAYMENT || stage == AttendanceDocumentStage.INVOICING) {
            var uploader = users.filterEmail(scope.getCompanyId(), scope.getResaleId(), email);
            if (uploader == null || uploader.getId() == null) throw new BusinessException("Usuario autenticado nao encontrado.");
            document.setUploadedByUserId(uploader.getId());
            document.setUploadedByUserName(uploader.getName());
            document.setUpdatedByUserId(uploader.getId());
            document.setUpdatedByUserName(uploader.getName());
            document.setUpdatedAt(java.time.Instant.now());
        }
        document.setAttendanceId(attendanceId);
        document.setStage(stage);
        if(stage == AttendanceDocumentStage.PAYMENT || stage == AttendanceDocumentStage.INVOICING) document.setReceiptAmount(receiptAmount.setScale(2));
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
            logDocumentAction(scope, document, AttendanceLogAction.DOCUMENT_ADDED, email);
        } catch (RuntimeException error) {
            try {
                storage.delete(filePath);
            } catch (IOException cleanup) {
                error.addSuppressed(cleanup);
            }
            throw error;
        }
        return metadata(document);
    }


    private void validateReceiptAmount(java.math.BigDecimal amount) {
        if(amount == null || amount.signum() <= 0 || amount.stripTrailingZeros().scale() > 2 || amount.compareTo(new java.math.BigDecimal("999999999999.99")) > 0)
            throw new BusinessException("Informe um valor positivo para o documento, com ate duas casas decimais.");
    }
    private AttendanceDocumentDto metadata(AttendanceDocument document) {
        return new AttendanceDocumentDto(document.getId(),document.getFileName(),document.getContentType(),document.getSize(),document.getCreatedAt(),document.getStage(),document.getProposalApprovedAt(),document.getSignedFileName(),document.getSignedUploadedAt(),document.getOrderApprovedAt(),document.getReceiptAmount(),document.getUploadedByUserId(),document.getUploadedByUserName(),document.getUpdatedByUserId(),document.getUpdatedByUserName(),document.getUpdatedAt());
    }
    @Transactional
    public AttendanceDocumentDto updateReceiptAmount(Integer attendanceId,Integer documentId,java.math.BigDecimal amount,String email) {
        return updateDocumentAmount(attendanceId, documentId, amount, AttendanceDocumentStage.PAYMENT, email);
    }
    @Transactional
    public AttendanceDocumentDto updateInvoiceAmount(Integer attendanceId,Integer documentId,java.math.BigDecimal amount,String email) {
        return updateDocumentAmount(attendanceId, documentId, amount, AttendanceDocumentStage.INVOICING, email);
    }
    private AttendanceDocumentDto updateDocumentAmount(Integer attendanceId,Integer documentId,java.math.BigDecimal amount,AttendanceDocumentStage stage,String email) {
        CustomerAttendance scope=attendances.authorizedAttendance(attendanceId,email);
        CustomerAttendance attendance=attendanceRepository.findForQuote(scope.getCompanyId(),scope.getResaleId(),attendanceId);
        if(attendance==null) throw new ResourcesNotFoundException("Atendimento nao encontrado.");
        if(attendance.getStatus()==AttendanceStatus.COMPLETED) throw new BusinessException("O atendimento concluído está disponível apenas para consulta.");
        if(attendance.getStatus()==AttendanceStatus.CANCELLED) throw new BusinessException("O atendimento cancelado permite apenas consultar documentos.");
        validateReceiptAmount(amount);
        AttendanceDocument document=documents.findByAttendanceIdAndId(attendanceId,documentId).orElseThrow(()->new ResourcesNotFoundException("Comprovante nao encontrado neste atendimento."));
        if(document.getStage()!=stage) throw new BusinessException("O documento nao pertence a esta etapa do atendimento.");
        var editor = users.filterEmail(scope.getCompanyId(), scope.getResaleId(), email);
        if (editor == null || editor.getId() == null) throw new BusinessException("Usuario autenticado nao encontrado.");
        java.math.BigDecimal previousAmount = document.getReceiptAmount();
        if (previousAmount != null && previousAmount.compareTo(amount) == 0) return metadata(document);
        document.setReceiptAmount(amount.setScale(2));
        document.setUpdatedByUserId(editor.getId());
        document.setUpdatedByUserName(editor.getName());
        document.setUpdatedAt(java.time.Instant.now());
        document = documents.saveAndFlush(document);
        logDocumentAction(scope, document, stage == AttendanceDocumentStage.INVOICING ? AttendanceLogAction.INVOICE_AMOUNT_CHANGED : AttendanceLogAction.RECEIPT_AMOUNT_CHANGED, email, previousAmount, document.getReceiptAmount());
        return metadata(document);
    }

    public record Download(AttendanceDocument document, byte[] content) {
    }

    @Transactional(readOnly = true)
    public Download download(Integer attendanceId, Integer documentId, String email) throws IOException {
        attendances.authorizedAttendance(attendanceId, email);
        AttendanceDocument document = documents.findByAttendanceIdAndId(attendanceId, documentId).orElseThrow(() -> new ResourcesNotFoundException("Documento não encontrado neste atendimento."));
        return new Download(document, storage.read(document.getFilePath()));
    }

    @Transactional
    public void removeProposalDocument(Integer attendanceId, Integer documentId, String email) {
        removeDocument(attendanceId, documentId, AttendanceDocumentStage.PROPOSAL, email);
    }

    @Transactional
    public void removeOrderDocument(Integer attendanceId, Integer documentId, String email) {
        removeDocument(attendanceId, documentId, AttendanceDocumentStage.DOCUMENTS, email);
    }

    @Transactional
    public void removePaymentReceipt(Integer attendanceId, Integer documentId, String email) {
        removeDocument(attendanceId, documentId, AttendanceDocumentStage.PAYMENT, email);
    }

    @Transactional
    public void removeInvoicingDocument(Integer attendanceId, Integer documentId, String email) {
        removeDocument(attendanceId, documentId, AttendanceDocumentStage.INVOICING, email);
    }

    @Transactional
    public void removeDeliveryDocument(Integer attendanceId, Integer documentId, String email) {
        removeDocument(attendanceId, documentId, AttendanceDocumentStage.DELIVERY, email);
    }

    private void removeDocument(Integer attendanceId, Integer documentId, AttendanceDocumentStage stage, String email) {
        CustomerAttendance scope = attendances.authorizedAttendance(attendanceId, email);
        CustomerAttendance attendance = attendanceRepository.findForQuote(scope.getCompanyId(), scope.getResaleId(), attendanceId);
        if (attendance == null) throw new ResourcesNotFoundException("Atendimento nao encontrado.");
        if (attendance.getStatus() == AttendanceStatus.COMPLETED) throw new BusinessException("O atendimento concluído está disponível apenas para consulta.");
        if (attendance.getStatus() == AttendanceStatus.CANCELLED) throw new BusinessException("O atendimento cancelado permite apenas consultar documentos.");
        AttendanceDocument document = documents.findByAttendanceIdAndId(attendanceId, documentId).orElseThrow(() -> new ResourcesNotFoundException("Documento nao encontrado neste atendimento."));
        if (document.getStage() != stage) throw new BusinessException("O documento nao pertence a esta etapa do atendimento.");
        logDocumentAction(scope, document, AttendanceLogAction.DOCUMENT_REMOVED, email);
        documents.delete(document);
        documents.flush();
        // Remove bytes only after metadata commits, preserving downloads if the transaction rolls back.
        org.springframework.transaction.support.TransactionSynchronizationManager.registerSynchronization(new org.springframework.transaction.support.TransactionSynchronization() {
            @Override public void afterCommit() {
                for (String path : java.util.stream.Stream.of(document.getFilePath(), document.getSignedFilePath()).filter(java.util.Objects::nonNull).distinct().toList()) {
                    try { storage.delete(path); }
                    catch (IOException error) { org.slf4j.LoggerFactory.getLogger(AttendanceDocumentService.class).error("Could not remove deleted proposal attachment {}", documentId, error); }
                }
            }
        });
    }

    private void logDocumentAction(CustomerAttendance scope, AttendanceDocument document, AttendanceLogAction action, String email) {
        logDocumentAction(scope, document, action, email,
            action == AttendanceLogAction.DOCUMENT_REMOVED ? document.getReceiptAmount() : null,
            action == AttendanceLogAction.DOCUMENT_ADDED ? document.getReceiptAmount() : null);
    }

    private void logDocumentAction(CustomerAttendance scope, AttendanceDocument document, AttendanceLogAction action, String email, java.math.BigDecimal previousAmount, java.math.BigDecimal newAmount) {
        var user = users.filterEmail(scope.getCompanyId(), scope.getResaleId(), email);
        if (user == null || user.getId() == null) throw new BusinessException("Usuario autenticado nao encontrado.");
        AttendanceLog log = new AttendanceLog();
        log.setCompanyId(scope.getCompanyId());
        log.setResaleId(scope.getResaleId());
        log.setAttendanceId(scope.getId());
        log.setStage(switch (document.getStage()) {
            case PROPOSAL -> AttendanceStatus.COMMERCIAL_PROPOSAL;
            case DOCUMENTS -> AttendanceStatus.QUOTATION;
            case PAYMENT -> AttendanceStatus.PAYMENT_PENDING;
            case INVOICING -> AttendanceStatus.INVOICING_PENDING;
            case DELIVERY -> AttendanceStatus.DELIVERY_PENDING;
        });
        log.setAction(action);
        log.setUserId(user.getId());
        log.setUserName(user.getName());
        log.setOccurredAt(java.time.Instant.now());
        log.setDocumentId(document.getId());
        log.setFileName(document.getFileName());
        log.setPreviousAmount(previousAmount);
        log.setNewAmount(newAmount);
        logs.saveAndFlush(log);
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
