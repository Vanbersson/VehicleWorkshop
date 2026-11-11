package com.concierge.apiconcierge.controllers.vehicle;

import com.concierge.apiconcierge.dtos.vehicle.budget.BudgetConciergeCreate;
import com.concierge.apiconcierge.models.vehicle.budget.BudgetConcierge;
import com.concierge.apiconcierge.services.vehicle.budget.BudgetConciergeService;
import com.concierge.apiconcierge.services.auth.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import java.util.List;

@RestController
@RequestMapping("/concierge/budgets/{companyId}/{resaleId}")
public class BudgetConciergeController {
    private final BudgetConciergeService service;
    private final TokenService tokens;
    private final com.concierge.apiconcierge.services.vehicle.budget.BudgetConciergeApprovalService approvals;

    public BudgetConciergeController(BudgetConciergeService service, TokenService tokens, com.concierge.apiconcierge.services.vehicle.budget.BudgetConciergeApprovalService approvals) {
        this.service = service;
        this.tokens = tokens;
        this.approvals = approvals;
    }

    private String email(HttpServletRequest request) {
        return tokens.validToken(request.getHeader("Authorization").replace("Bearer ", ""));
    }

    @GetMapping
    public ResponseEntity<List<BudgetConcierge>> list(@RequestParam(defaultValue = "OpenBudget") com.concierge.apiconcierge.models.budget.enums.StatusBudgetEnum status, HttpServletRequest request) {
        List<BudgetConcierge> response = service.list(email(request), status);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @PostMapping("/{id}/share")
    public com.concierge.apiconcierge.services.vehicle.budget.BudgetConciergeApprovalService.Share share(@PathVariable Integer companyId, @PathVariable Integer resaleId, @PathVariable Integer id, HttpServletRequest request) {
        return approvals.create(companyId, resaleId, id, email(request));
    }

    @GetMapping("/attendants")
    public List<BudgetConciergeService.AttendantOption> attendants(@PathVariable Integer companyId, @PathVariable Integer resaleId, HttpServletRequest request) {
        return service.attendants(companyId, resaleId, email(request));
    }

    @GetMapping("/{id}")
    public BudgetConcierge detail(@PathVariable Integer companyId, @PathVariable Integer resaleId, @PathVariable Integer id, HttpServletRequest request) {
        return service.detail(companyId, resaleId, id, email(request));
    }

    @PutMapping("/{id}")
    public BudgetConcierge update(@PathVariable Integer companyId, @PathVariable Integer resaleId, @PathVariable Integer id, @Valid @RequestBody BudgetConciergeCreate data, HttpServletRequest request) {
        return service.update(companyId, resaleId, id, data, email(request));
    }

    @PostMapping("/{id}/cancel")
    public BudgetConcierge cancel(@PathVariable Integer companyId, @PathVariable Integer resaleId, @PathVariable Integer id, @Valid @RequestBody com.concierge.apiconcierge.dtos.vehicle.budget.BudgetConciergeCancel data, HttpServletRequest request) {
        return service.cancel(companyId, resaleId, id, data.reason(), email(request));
    }

    @PostMapping("/{id}/complete")
    public BudgetConcierge complete(@PathVariable Integer companyId, @PathVariable Integer resaleId, @PathVariable Integer id, HttpServletRequest request) {
        return service.complete(companyId, resaleId, id, email(request));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BudgetConcierge create(@PathVariable Integer companyId, @PathVariable Integer resaleId, @Valid @RequestBody BudgetConciergeCreate data, HttpServletRequest request) {
        return service.create(companyId, resaleId, data, email(request));
    }
}
