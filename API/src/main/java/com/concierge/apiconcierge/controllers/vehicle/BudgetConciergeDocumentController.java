package com.concierge.apiconcierge.controllers.vehicle;
import com.concierge.apiconcierge.models.vehicle.budget.BudgetConciergeDocument;
import com.concierge.apiconcierge.services.vehicle.budget.BudgetConciergeDocumentService;
import com.concierge.apiconcierge.services.auth.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.*;
import java.util.List;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
@RestController @RequestMapping("/concierge/budgets/{companyId}/{resaleId}/{budgetId}/documents")
public class BudgetConciergeDocumentController {
    private final BudgetConciergeDocumentService service; private final TokenService tokens;
    public BudgetConciergeDocumentController(BudgetConciergeDocumentService service,TokenService tokens) { this.service=service; this.tokens=tokens; }
    private String email(HttpServletRequest request) { return tokens.validToken(request.getHeader("Authorization").replace("Bearer ","")); }
    @GetMapping public List<BudgetConciergeDocument> list(@PathVariable Integer companyId,@PathVariable Integer resaleId,@PathVariable Integer budgetId,HttpServletRequest request) { return service.list(companyId,resaleId,budgetId,email(request)); }
    @PostMapping(consumes=MediaType.MULTIPART_FORM_DATA_VALUE) @ResponseStatus(HttpStatus.CREATED)
    public BudgetConciergeDocument upload(@PathVariable Integer companyId,@PathVariable Integer resaleId,@PathVariable Integer budgetId,@RequestParam("file") MultipartFile file,HttpServletRequest request) throws IOException { return service.upload(companyId,resaleId,budgetId,file,email(request)); }
    @GetMapping("/{id}") public ResponseEntity<byte[]> download(@PathVariable Integer companyId,@PathVariable Integer resaleId,@PathVariable Integer budgetId,@PathVariable Integer id,HttpServletRequest request) throws IOException {
        var result=service.download(companyId,resaleId,budgetId,id,email(request));
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_PDF).contentLength(result.metadata().getSize()).header(HttpHeaders.CONTENT_DISPOSITION,ContentDisposition.attachment().filename(result.metadata().getFileName(),StandardCharsets.UTF_8).build().toString()).header(HttpHeaders.CACHE_CONTROL,"no-store").header("X-Content-Type-Options","nosniff").body(result.bytes());
    }
    @PostMapping("/{id}/remove") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void remove(@PathVariable Integer companyId,@PathVariable Integer resaleId,@PathVariable Integer budgetId,@PathVariable Integer id,HttpServletRequest request) { service.remove(companyId,resaleId,budgetId,id,email(request)); }
}
