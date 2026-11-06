package com.concierge.apiconcierge.controllers.crm;

import com.concierge.apiconcierge.models.crm.attendance.AttendanceDocument;
import com.concierge.apiconcierge.services.crm.attendance.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;

@RestController
@RequestMapping("/public/{kind:proposals|orders}/{token}")
public class PublicApprovalPageController {
    private final ProposalDocumentShareService proposals;
    private final OrderDocumentShareService orders;
    private final PublicDocumentClientAccess access;

    public PublicApprovalPageController(ProposalDocumentShareService proposals, OrderDocumentShareService orders, PublicDocumentClientAccess access) {
        this.proposals = proposals;
        this.orders = orders;
        this.access = access;
    }

    public record Page(boolean accessRequired, String fileName, String contentType, Long size, String signedFileName,
                       Instant signedUploadedAt, Instant approvedAt) {
    }

    public record Identification(@NotBlank @Size(max = 32) String taxId) {
    }

    public record Confirmation(boolean confirmed) {
    }

    private AttendanceDocument document(String kind, String token) {
        return kind.equals("orders") ? orders.page(token) : proposals.page(token);
    }

    private Page data(String kind, String token, HttpServletRequest request) {
        var doc = document(kind, token);
        if (!access.allowed(token, doc, request)) return new Page(true, null, null, null, null, null, null);
        return new Page(false, doc.getFileName(), doc.getContentType(), doc.getSize(), doc.getSignedFileName(), doc.getSignedUploadedAt(), kind.equals("orders") ? doc.getOrderApprovedAt() : doc.getProposalApprovedAt());
    }

    @GetMapping("/data")
    public ResponseEntity<Page> page(@PathVariable String kind, @PathVariable String token, HttpServletRequest request) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(data(kind, token, request));
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verify(@PathVariable String kind, @PathVariable String token, @Valid @RequestBody Identification input, HttpServletRequest request) {
        if (!access.verify(token, document(kind, token), input.taxId(), request))
            return ResponseEntity.status(HttpStatus.FORBIDDEN).cacheControl(CacheControl.noStore()).body(Map.of("message", "Documento nao confere."));
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(data(kind, token, request));
    }

    @PostMapping(value = "/signed-upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> upload(@PathVariable String kind, @PathVariable String token, @RequestParam("file") MultipartFile file, HttpServletRequest request) throws IOException {
        access.require(token, document(kind, token), request);
        if (kind.equals("orders")) orders.uploadSigned(token, file);
        else proposals.uploadSigned(token, file);
        return ResponseEntity.noContent().cacheControl(CacheControl.noStore()).build();
    }

    @PostMapping("/confirm")
    public ResponseEntity<Page> confirm(@PathVariable String kind, @PathVariable String token, @RequestBody Confirmation input, HttpServletRequest request) {
        access.require(token, document(kind, token), request);
        if (kind.equals("orders")) orders.approve(token, input.confirmed());
        else proposals.approve(token, input.confirmed());
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(data(kind, token, request));
    }

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<?> error(ResponseStatusException error) {
        return ResponseEntity.status(error.getStatusCode()).cacheControl(CacheControl.noStore()).body(Map.of("message", error.getReason() == null ? "Link indisponivel ou expirado." : error.getReason()));
    }
}
