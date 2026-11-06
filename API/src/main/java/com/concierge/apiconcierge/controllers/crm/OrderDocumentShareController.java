package com.concierge.apiconcierge.controllers.crm;

import com.concierge.apiconcierge.services.crm.attendance.OrderDocumentShareService;
import com.concierge.apiconcierge.services.auth.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;

import java.nio.charset.StandardCharsets;
import java.io.IOException;

@RestController
public class OrderDocumentShareController {
    private final com.concierge.apiconcierge.services.crm.attendance.PublicDocumentClientAccess access;
    @org.springframework.beans.factory.annotation.Value("${app.public-url:http://localhost:4200}")
    private String publicUrl = "http://localhost:4200";
    private final OrderDocumentShareService service;
    private final TokenService tokens;

    public OrderDocumentShareController(OrderDocumentShareService service, TokenService tokens, com.concierge.apiconcierge.services.crm.attendance.PublicDocumentClientAccess access) {
        this.service = service;
        this.tokens = tokens;
        this.access = access;
    }

    @PostMapping("/crm/customer-attendance/{attendanceId}/documents/{documentId}/order-share")
    public OrderDocumentShareService.Share create(@PathVariable Integer attendanceId, @PathVariable Integer documentId, HttpServletRequest request) {
        return service.create(attendanceId, documentId, tokens.validToken(request.getHeader("Authorization").replace("Bearer ", "")));
    }

    @GetMapping("/public/orders/{token}/file")
    public ResponseEntity<byte[]> view(@PathVariable String token, HttpServletRequest request) throws IOException {
        access.require(token, service.page(token), request);
        var result = service.view(token);
        var doc = result.document();
        return ResponseEntity.ok().contentType(MediaType.parseMediaType(doc.getContentType())).contentLength(doc.getSize())
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(doc.getFileName(), StandardCharsets.UTF_8).build().toString())
                .header("X-Frame-Options", "SAMEORIGIN").header(HttpHeaders.CACHE_CONTROL, "no-store").header("Referrer-Policy", "no-referrer").header("X-Content-Type-Options", "nosniff").body(result.content());
    }

    @GetMapping("/public/orders/{token}")
    public ResponseEntity<Void> page(@PathVariable String token, HttpServletRequest request) {
        return ResponseEntity.status(HttpStatus.SEE_OTHER).header(HttpHeaders.LOCATION, publicUrl.replaceAll("/+$", "") + "/public/orders/" + token).cacheControl(CacheControl.noStore()).build();
    }

    @PostMapping(value = "/public/orders/{token}/signed", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> uploadSigned(@PathVariable String token, @RequestParam("file") org.springframework.web.multipart.MultipartFile file, HttpServletRequest request) throws IOException {
        access.require(token, service.page(token), request);
        service.uploadSigned(token, file);
        return ResponseEntity.status(HttpStatus.SEE_OTHER).header(HttpHeaders.LOCATION, "../" + token).header(HttpHeaders.CACHE_CONTROL, "no-store").build();
    }

    @GetMapping("/public/orders/{token}/signed")
    public ResponseEntity<byte[]> signed(@PathVariable String token, HttpServletRequest request) throws IOException {
        access.require(token, service.page(token), request);
        return signedResponse(service.signed(token));
    }

    @GetMapping("/crm/customer-attendance/{attendanceId}/documents/{documentId}/order-signed")
    public ResponseEntity<byte[]> signedInternal(@PathVariable Integer attendanceId, @PathVariable Integer documentId, HttpServletRequest request) throws IOException {
        return signedResponse(service.signed(attendanceId, documentId, tokens.validToken(request.getHeader("Authorization").replace("Bearer ", ""))));
    }

    private ResponseEntity<byte[]> signedResponse(com.concierge.apiconcierge.services.crm.attendance.AttendanceDocumentService.Download result) {
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_PDF).contentLength(result.content().length)
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(result.document().getFileName(), StandardCharsets.UTF_8).build().toString())
                .header(HttpHeaders.CACHE_CONTROL, "no-store").header("Referrer-Policy", "no-referrer").header("X-Content-Type-Options", "nosniff").body(result.content());
    }

    @PostMapping("/public/orders/{token}/approve")
    public ResponseEntity<Void> approve(@PathVariable String token, @RequestParam(defaultValue = "false") boolean confirmed, HttpServletRequest request) {
        access.require(token, service.page(token), request);
        service.approve(token, confirmed);
        return ResponseEntity.status(HttpStatus.SEE_OTHER).header(HttpHeaders.LOCATION, "../" + token).header(HttpHeaders.CACHE_CONTROL, "no-store").build();
    }


    @PostMapping("/public/orders/{token}/access")
    public ResponseEntity<?> verifyAccess(@PathVariable String token, @RequestParam String taxId, HttpServletRequest request) {
        var document = service.page(token);
        String path = request.getContextPath() + "/public/orders/" + token;
        if (access.verify(token, document, taxId, request))
            return ResponseEntity.status(HttpStatus.SEE_OTHER).header(HttpHeaders.LOCATION, path).header(HttpHeaders.CACHE_CONTROL, "no-store").build();
        return ResponseEntity.status(HttpStatus.FORBIDDEN).contentType(new MediaType("text", "html", StandardCharsets.UTF_8)).header(HttpHeaders.CACHE_CONTROL, "no-store").header("Referrer-Policy", "no-referrer").header("X-Robots-Tag", "noindex, nofollow").header("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'").body(PublicDocumentAccessPage.render(path, true, true));
    }

    @ExceptionHandler(org.springframework.web.server.ResponseStatusException.class)
    public ResponseEntity<String> unavailable(org.springframework.web.server.ResponseStatusException error) {
        String message = error.getStatusCode().value() == 400 || error.getStatusCode().value() == 409 || error.getStatusCode().value() == 403 || error.getStatusCode().value() == 429 ? org.springframework.web.util.HtmlUtils.htmlEscape(error.getReason() == null ? "Revise os dados enviados." : error.getReason()) : "Este link esta indisponivel ou expirou. Solicite um novo link ao vendedor.";
        return ResponseEntity.status(error.getStatusCode()).contentType(new MediaType("text", "html", StandardCharsets.UTF_8))
                .header(HttpHeaders.CACHE_CONTROL, "no-store").header("Referrer-Policy", "no-referrer").header("X-Robots-Tag", "noindex, nofollow")
                .body("<!doctype html><html lang=\"pt-BR\"><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Pedido indisponivel</title><body style=\"font-family:system-ui;max-width:600px;margin:10vh auto;padding:24px\"><h1>Pedido indisponivel</h1><p>" + message + "</p></body></html>");
    }

}
