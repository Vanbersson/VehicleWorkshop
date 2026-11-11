package com.concierge.apiconcierge.controllers.vehicle;

import com.concierge.apiconcierge.services.vehicle.budget.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/public/concierge-budgets/{token}")
public class PublicConciergeBudgetController {
    private final BudgetConciergeApprovalService service;

    public PublicConciergeBudgetController(BudgetConciergeApprovalService service) {
        this.service = service;
    }

    public record Identity(String taxId) {
    }

    public record Confirmation(boolean confirmed) {
    }

    @GetMapping("/data")
    public BudgetConciergeApprovalService.Page data(@PathVariable String token, HttpServletRequest request) {
        return service.data(token, request);
    }

    @PostMapping("/verify")
    public BudgetConciergeApprovalService.Page verify(@PathVariable String token, @RequestBody Identity identity, HttpServletRequest request) {
        return service.verify(token, identity.taxId(), request);
    }

    @PostMapping("/confirm")
    public BudgetConciergeApprovalService.Page approve(@PathVariable String token, @RequestBody Confirmation confirmation, HttpServletRequest request) {
        return service.approve(token, confirmation.confirmed(), request);
    }

    @GetMapping("/file")
    public ResponseEntity<byte[]> download(@PathVariable String token, HttpServletRequest request) throws IOException {
        var result = service.download(token, request);
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_PDF).header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(result.metadata().getFileName(), StandardCharsets.UTF_8).build().toString()).header(HttpHeaders.CACHE_CONTROL, "no-store").header("X-Content-Type-Options", "nosniff").body(result.bytes());
    }
}
