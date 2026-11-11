package com.concierge.apiconcierge.services.vehicle.budget;

import com.concierge.apiconcierge.models.vehicle.budget.*;
import com.concierge.apiconcierge.models.budget.enums.StatusBudgetEnum;
import com.concierge.apiconcierge.repositories.vehicle.budget.*;
import com.concierge.apiconcierge.repositories.vehicle.entry.IVehicleEntryRepository;
import com.concierge.apiconcierge.repositories.clientcompany.IClientCompanyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import jakarta.servlet.http.HttpServletRequest;

import java.security.*;
import java.nio.charset.StandardCharsets;
import java.time.*;
import java.math.*;
import java.util.*;
import java.io.IOException;

@Service
public class BudgetConciergeApprovalService {
    private final BudgetConciergeService scope;
    private final IBudgetConciergeRepository budgets;
    private final IBudgetConciergeDocumentRepository documents;
    private final IVehicleEntryRepository vehicles;
    private final IClientCompanyRepository clients;
    private final BudgetConciergeDocumentStorage storage;
    private final PublicBudgetClientAccess access;
    private final SecureRandom random = new SecureRandom();

    public BudgetConciergeApprovalService(BudgetConciergeService scope, IBudgetConciergeRepository budgets, IBudgetConciergeDocumentRepository documents, IVehicleEntryRepository vehicles, IClientCompanyRepository clients, BudgetConciergeDocumentStorage storage, PublicBudgetClientAccess access) {
        this.scope = scope;
        this.budgets = budgets;
        this.documents = documents;
        this.vehicles = vehicles;
        this.clients = clients;
        this.storage = storage;
        this.access = access;
    }

    public record Share(String path, Instant expiresAt) {
    }

    private record Context(BudgetConcierge budget, BudgetConciergeDocument document) {
    }

    public record Item(Integer type, String description, BigDecimal quantity, BigDecimal hourService, BigDecimal price,
                       BigDecimal discount, BigDecimal total) {
    }

    public record Page(boolean accessRequired, Integer budgetId, String clientName, String vehiclePlate,
                       String fileName, Long size, LocalDateTime dateValidation, Instant approvedAt, BigDecimal total,
                       List<Item> items) {
    }

    private ResponseStatusException unavailable() {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, "Link indisponivel ou expirado.");
    }

    private String hash(String token) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.US_ASCII)));
        } catch (NoSuchAlgorithmException error) {
            throw new IllegalStateException(error);
        }
    }

    private void token(String token) {
        if (token == null || !token.matches("[A-Za-z0-9_-]{43}")) throw unavailable();
    }

    @Transactional
    public Share create(Integer company, Integer resale, Integer budgetId, String email) {
        var budget = scope.documentScope(company, resale, budgetId, email, true);
        if (budget.getDateValidation() != null && budget.getDateValidation().isBefore(LocalDateTime.now()))
            throw unavailable();
        var client = clients.filterId(company, resale, budget.getClientCompanyId());
        if (client == null || ((client.getCpf() == null || client.getCpf().isBlank()) && (client.getCnpj() == null || client.getCnpj().isBlank())))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cadastre o CPF ou CNPJ do cliente antes de compartilhar.");
        var document = documents.findByCompanyIdAndResaleIdAndBudgetId(company, resale, budgetId).stream().findFirst().orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Anexe o PDF do orcamento antes de compartilhar."));
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        String token = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        Instant expires = Instant.now().plusSeconds(7 * 24 * 3600);
        document.setShareTokenHash(hash(token));
        document.setShareExpiresAt(expires);
        documents.saveAndFlush(document);
        return new Share("/public/concierge-budgets/" + token, expires);
    }

    private Context validate(BudgetConciergeDocument document, BudgetConcierge budget) {
        if (document.getShareExpiresAt() == null || !document.getShareExpiresAt().isAfter(Instant.now()) || budget.getStatus() == StatusBudgetEnum.CancelledBudget || !Objects.equals(document.getCompanyId(), budget.getCompanyId()) || !Objects.equals(document.getResaleId(), budget.getResaleId()))
            throw unavailable();
        if (document.getApprovedAt() == null && (budget.getStatus() != StatusBudgetEnum.OpenBudget || (budget.getDateValidation() != null && budget.getDateValidation().isBefore(LocalDateTime.now()))))
            throw unavailable();
        return new Context(budget, document);
    }

    private Context context(String token) {
        token(token);
        var document = documents.findByShareTokenHash(hash(token)).orElseThrow(this::unavailable);
        var budget = budgets.findById(document.getBudgetId()).orElseThrow(this::unavailable);
        return validate(document, budget);
    }

    private Page hidden() {
        return new Page(true, null, null, null, null, null, null, null, null, List.of());
    }

    private Page page(Context context) {
        var budget = context.budget();
        var document = context.document();
        var vehicle = vehicles.filterId(budget.getCompanyId(), budget.getResaleId(), budget.getVehicleId());
        List<Item> items = budget.getItems().stream().map(item -> {
            BigDecimal gross = (item.getType() == 1 ? item.getHourService() : item.getQuantity()).multiply(item.getPrice()).setScale(3, RoundingMode.HALF_UP);
            return new Item(item.getType(), item.getDescription(), item.getType() == 1 ? BigDecimal.ONE : item.getQuantity(), item.getHourService(), item.getPrice(), item.getDiscount(), gross.subtract(item.getDiscount()));
        }).toList();
        BigDecimal total = items.stream().map(Item::total).reduce(BigDecimal.ZERO, BigDecimal::add);
        return new Page(false, budget.getId(), budget.getClientCompanyName(), vehicle == null ? null : vehicle.getVehiclePlate(), document.getFileName(), document.getSize(), budget.getDateValidation(), document.getApprovedAt(), total, items);
    }

    @Transactional(readOnly = true)
    public Page data(String token, HttpServletRequest request) {
        var context = context(token);
        return access.allowed(token, context.budget(), request) ? page(context) : hidden();
    }

    @Transactional(readOnly = true)
    public Page verify(String token, String taxId, HttpServletRequest request) {
        var context = context(token);
        if (!access.verify(token, context.budget(), taxId, request))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "CPF ou CNPJ nao confere com o cliente deste orcamento.");
        return page(context);
    }

    @Transactional
    public Page approve(String token, boolean confirmed, HttpServletRequest request) {
        if (!confirmed) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Confirme a leitura do orcamento.");
        token(token);
        String hash = hash(token);
        var binding = documents.shareScope(hash).orElseThrow(this::unavailable);
        var budget = budgets.lockBudget(binding.getCompanyId(), binding.getResaleId(), binding.getBudgetId()).orElseThrow(this::unavailable);
        var document = documents.lockForApproval(hash).orElseThrow(this::unavailable);
        var context = validate(document, budget);
        access.require(token, budget, request);
        if (document.getApprovedAt() == null) {
            document.setApprovedAt(Instant.now());
            budget.setStatus(StatusBudgetEnum.Approved);
            budget.setDateAuthorization(LocalDateTime.now());
            documents.saveAndFlush(document);
            budgets.saveAndFlush(budget);
        }
        return page(context);
    }

    @Transactional(readOnly = true)
    public BudgetConciergeDocumentService.Download download(String token, HttpServletRequest request) throws IOException {
        var context = context(token);
        access.require(token, context.budget(), request);
        var document = context.document();
        return new BudgetConciergeDocumentService.Download(document, storage.read(document.getFilePath()));
    }
}
