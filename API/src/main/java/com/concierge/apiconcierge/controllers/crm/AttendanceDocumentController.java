package com.concierge.apiconcierge.controllers.crm;

import com.concierge.apiconcierge.dtos.crm.attendance.AttendanceDocumentDto;
import com.concierge.apiconcierge.services.crm.attendance.AttendanceDocumentService;
import com.concierge.apiconcierge.services.auth.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;

import com.concierge.apiconcierge.models.crm.attendance.AttendanceDocumentStage;

@RestController
@RequestMapping("/crm/customer-attendance/{attendanceId}/documents")
public class AttendanceDocumentController {
    private final AttendanceDocumentService service;
    private final TokenService tokens;

    public AttendanceDocumentController(AttendanceDocumentService service, TokenService tokens) {
        this.service = service;
        this.tokens = tokens;
    }

    @GetMapping
    public List<AttendanceDocumentDto> list(@PathVariable Integer attendanceId, @RequestParam(defaultValue = "DOCUMENTS") AttendanceDocumentStage stage, HttpServletRequest request) {
        return service.list(attendanceId, stage, email(request));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public AttendanceDocumentDto upload(@PathVariable Integer attendanceId, @RequestParam("file") MultipartFile file, @RequestParam(defaultValue = "DOCUMENTS") AttendanceDocumentStage stage, @RequestParam(required = false) java.math.BigDecimal receiptAmount, HttpServletRequest request) throws IOException {
        return service.upload(attendanceId, file, stage, receiptAmount, email(request));
    }

    @GetMapping("/{documentId}")
    public ResponseEntity<byte[]> download(@PathVariable Integer attendanceId, @PathVariable Integer documentId, HttpServletRequest request) throws IOException {
        var download = service.download(attendanceId, documentId, email(request));
        var document = download.document();
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(document.getContentType())).contentLength(document.getSize())
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(document.getFileName(), StandardCharsets.UTF_8).build().toString())
                .header(HttpHeaders.CACHE_CONTROL, "no-store").header("X-Content-Type-Options", "nosniff").body(download.content());
    }

    @PostMapping("/{documentId}/remove")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@PathVariable Integer attendanceId, @PathVariable Integer documentId, HttpServletRequest request) {
        service.removeProposalDocument(attendanceId, documentId, email(request));
    }

    @PostMapping("/{documentId}/order-remove")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeOrder(@PathVariable Integer attendanceId, @PathVariable Integer documentId, HttpServletRequest request) {
        service.removeOrderDocument(attendanceId, documentId, email(request));
    }

    @PostMapping("/{documentId}/payment-remove")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removePaymentReceipt(@PathVariable Integer attendanceId, @PathVariable Integer documentId, HttpServletRequest request) {
        service.removePaymentReceipt(attendanceId, documentId, email(request));
    }

    public record ReceiptValue(java.math.BigDecimal receiptAmount) {
    }

    @PostMapping("/{documentId}/payment-value")
    public AttendanceDocumentDto updateReceiptAmount(@PathVariable Integer attendanceId, @PathVariable Integer documentId, @RequestBody ReceiptValue data, HttpServletRequest request) {
        return service.updateReceiptAmount(attendanceId, documentId, data.receiptAmount(), email(request));
    }

    private String email(HttpServletRequest request) {
        return tokens.validToken(request.getHeader("Authorization").replace("Bearer ", ""));
    }
}
