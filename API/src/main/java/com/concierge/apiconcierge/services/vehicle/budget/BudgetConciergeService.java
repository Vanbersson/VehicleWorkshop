package com.concierge.apiconcierge.services.vehicle.budget;

import com.concierge.apiconcierge.dtos.vehicle.budget.BudgetConciergeCreate;
import com.concierge.apiconcierge.models.vehicle.budget.BudgetConcierge;
import com.concierge.apiconcierge.models.budget.enums.StatusBudgetEnum;
import com.concierge.apiconcierge.models.vehicle.enums.StatusVehicleEnum;
import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.user.*;
import com.concierge.apiconcierge.repositories.vehicle.budget.IBudgetConciergeRepository;
import com.concierge.apiconcierge.repositories.vehicle.entry.IVehicleEntryRepository;
import com.concierge.apiconcierge.repositories.user.IUserRepository;
import com.concierge.apiconcierge.repositories.payment.ITypePaymentRepository;
import com.concierge.apiconcierge.repositories.clientcompany.IClientCompanyRepository;
import com.concierge.apiconcierge.exceptions.BusinessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import static com.concierge.apiconcierge.util.ConstantsPermission.*;
import java.time.LocalDateTime;
import java.util.*;


@Service
public class BudgetConciergeService {
    private final IBudgetConciergeRepository budgets;
    private final IVehicleEntryRepository vehicles;
    private final IUserRepository users;
    private final com.concierge.apiconcierge.repositories.permission.IPermissionUserRepository permissions;
    private final com.concierge.apiconcierge.repositories.salesperson.ISalespersonRepository salespeople;
    private final ITypePaymentRepository payments;
    private final IClientCompanyRepository clients;
    private final com.concierge.apiconcierge.repositories.vehicle.budget.IBudgetConciergeDocumentRepository documents;

    public BudgetConciergeService(IBudgetConciergeRepository budgets, IVehicleEntryRepository vehicles, IUserRepository users, com.concierge.apiconcierge.repositories.permission.IPermissionUserRepository permissions, com.concierge.apiconcierge.repositories.salesperson.ISalespersonRepository salespeople, ITypePaymentRepository payments, IClientCompanyRepository clients, com.concierge.apiconcierge.repositories.vehicle.budget.IBudgetConciergeDocumentRepository documents) {
        this.budgets = budgets;
        this.vehicles = vehicles;
        this.users = users;
        this.permissions = permissions;
        this.salespeople = salespeople;
        this.payments = payments;
        this.clients = clients;
        this.documents = documents;
    }

    private User authorize(User user) {
        if (user == null || user.getStatus() == StatusEnableDisable.Desabilitado || user.getCompanyId() == null || user.getResaleId() == null)
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado.");
        return user;
    }

    private User authorize(Integer companyId, Integer resaleId, String email) {
        User user = users.loginEmail(email);
        if (user == null || !Objects.equals(user.getCompanyId(), companyId) || !Objects.equals(user.getResaleId(), resaleId))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado.");
        return authorize(user);
    }

    private boolean hasPermission(User user, Integer permission) {
        return permissions.findPermissionId(user.getCompanyId(), user.getResaleId(), user.getId(), permission) != null;
    }

    private boolean ownsSalesperson(User user, Integer salespersonId) {
        if (salespersonId == null) return false;
        var person = salespeople.findByCompanyIdAndResaleIdAndId(user.getCompanyId(), user.getResaleId(), salespersonId);
        return person != null && Objects.equals(person.getUserId(), user.getId());
    }

    private void requireSalespersonAccess(User user, Integer salespersonId, Integer permission) {
        if (!hasPermission(user, permission) && !ownsSalesperson(user, salespersonId))
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Sem permissao para operar orcamentos de outros vendedores. Permissao necessaria: " + permission + ".");
    }

    private BudgetConcierge accessInfo(BudgetConcierge budget, User user) {
        budget.setCanEdit(hasPermission(user, UPDATE_BUDGET_ALL_SALESPERSON) || ownsSalesperson(user, budget.getSalespersonUserId()));
        return budget;
    }
    public record AttendantOption(Integer id, String name) {
    }

    @Transactional(readOnly = true)
    public List<AttendantOption> attendants(Integer companyId, Integer resaleId, String email) {
        User user = authorize(companyId, resaleId, email);
        boolean all = hasPermission(user, CREATE_BUDGET_ALL_SALESPERSON);
        return salespeople.findByCompanyIdAndResaleId(companyId, resaleId).stream().filter(person -> person.getStatus() == StatusEnableDisable.Habilitado).filter(person -> all || Objects.equals(person.getUserId(), user.getId())).map(person -> new AttendantOption(person.getId(), person.getName())).toList();
    }

    @Transactional(readOnly = true)
    public List<BudgetConcierge> list(String email) {
        User user = authorize(users.loginEmail(email));
        return list(user.getCompanyId(), user.getResaleId(), email, StatusBudgetEnum.OpenBudget);
    }

    @Transactional(readOnly = true)
    public List<BudgetConcierge> list(Integer companyId, Integer resaleId, String email) {
        authorize(companyId, resaleId, email);
        return list(companyId, resaleId, email, StatusBudgetEnum.OpenBudget);
    }

    @Transactional(readOnly = true)
    public List<BudgetConcierge> list(String email, StatusBudgetEnum status) {
        User user = authorize(users.loginEmail(email));
        return list(user.getCompanyId(), user.getResaleId(), email, status);
    }

    @Transactional(readOnly = true)
    public List<BudgetConcierge> list(Integer companyId, Integer resaleId, String email, StatusBudgetEnum status) {
        authorize(companyId, resaleId, email);
        if (status == null)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Informe o status do orcamento.");
        User user = authorize(companyId, resaleId, email);
        var rows = hasPermission(user, LIST_BUDGET_ALL_SALESPERSON)
                ? budgets.listByStatus(companyId, resaleId, status)
                : budgets.listOwnByStatus(companyId, resaleId, status, user.getId());
        return rows.stream().map(row -> {
            BudgetConcierge budget = row.getBudget();
            budget.setVehiclePlate(row.getVehiclePlate());
            budget.getItems().size();
            return accessInfo(budget, user);
        }).toList();
    }
    @Transactional
    public BudgetConcierge create(Integer companyId, Integer resaleId, BudgetConciergeCreate data, String email) {
        User generator = authorize(companyId, resaleId, email);
        var draft = prepare(companyId, resaleId, data, generator, true);
        requireSalespersonAccess(generator, draft.getSalespersonUserId(), CREATE_BUDGET_ALL_SALESPERSON);
        return accessInfo(budgets.saveAndFlush(draft), generator);
    }

    private BudgetConcierge prepare(Integer companyId, Integer resaleId, BudgetConciergeCreate data, User generator, boolean requireActiveVehicle) {
        var vehicle = vehicles.filterId(companyId, resaleId, data.vehicleId());
        if (vehicle == null || (requireActiveVehicle && vehicle.getStatus() != StatusVehicleEnum.Entered))
            throw new BusinessException("Selecione uma entrada de veiculo ativa nesta filial.");
        Integer clientId = data.clientCompanyId() != null ? data.clientCompanyId() : vehicle.getClientCompanyId();
        Integer attendantId = data.salespersonUserId() != null ? data.salespersonUserId() : vehicle.getSalespersonId();
        if (clientId == null)
            throw new BusinessException("Informe o cliente no orcamento.");
        var client = clients.filterId(companyId, resaleId, clientId);
        var attendant = attendantId == null ? null : salespeople.findByCompanyIdAndResaleIdAndId(companyId, resaleId, attendantId);
        if (client == null || attendant == null || attendant.getStatus() != StatusEnableDisable.Habilitado || !Objects.equals(attendant.getCompanyId(), companyId) || !Objects.equals(attendant.getResaleId(), resaleId))
            throw new BusinessException("Cliente ou atendente nao pertence a esta filial.");
        if (data.information() != null && data.information().length() > 255)
            throw new BusinessException("Observacoes devem ter ate 255 caracteres.");
        BudgetConcierge budget = new BudgetConcierge();
        budget.setCompanyId(companyId);
        budget.setResaleId(resaleId);
        budget.setStatus(StatusBudgetEnum.OpenBudget);
        budget.setVehicleId(vehicle.getId());
        budget.setGenerationUserId(generator.getId());
        budget.setGenerationUserName(generator.getName());
        budget.setGenerationDate(LocalDateTime.now());
        budget.setSalespersonUserId(attendant.getId());
        budget.setSalespersonUserName(attendant.getName());
        budget.setClientCompanyId(client.getId());
        budget.setClientCompanyName(client.getName());
        budget.setDateValidation(data.dateValidation());
        budget.setInformation(data.information() == null ? "" : data.information().trim());
        if (data.paymentTypeId() != null) {
            var payment = payments.findById(data.paymentTypeId()).orElse(null);
            if (payment == null || !Objects.equals(payment.getCompanyId(), companyId) || !Objects.equals(payment.getResaleId(), resaleId) || payment.getStatus() == StatusEnableDisable.Desabilitado)
                throw new BusinessException("Forma de pagamento indisponivel nesta filial.");
            budget.setPaymentTypeId(payment.getId());
            budget.setPaymentTypeDesc(payment.getDescription());
        }
        if (data.items() == null || data.items().size() > 500)
            throw new BusinessException("Informe ate 500 itens ou servicos.");
        for (var line : data.items()) {
            if (line == null || line.type() == null || (line.type() != 0 && line.type() != 1) || line.description() == null || line.description().isBlank() || line.description().length() > 100)
                throw new BusinessException("Item ou servico invalido.");
            if (line.type() == 0) validateNumber(line.quantity(), 9, 2, true);
            validateNumber(line.price(), 8, 3, false);
            validateNumber(line.discount(), 8, 3, false);
            if (line.type() == 1) validateNumber(line.hourService(), 9, 2, true);
            java.math.BigDecimal gross = (line.type() == 1 ? line.hourService() : line.quantity()).multiply(line.price());
            gross = gross.setScale(3, java.math.RoundingMode.HALF_UP);
            if (gross.multiply(new java.math.BigDecimal("1000")).compareTo(new java.math.BigDecimal("9007199254740991")) > 0 || line.discount().compareTo(gross) > 0)
                throw new BusinessException("Desconto ou total da linha invalido.");
            var item = new com.concierge.apiconcierge.models.vehicle.budget.BudgetConciergeItem();
            item.setCompanyId(companyId);
            item.setResaleId(resaleId);
            item.setBudget(budget);
            item.setType(line.type());
            item.setDescription(line.description().trim());
            item.setQuantity(line.type() == 1 ? java.math.BigDecimal.ONE : line.quantity());
            item.setHourService(line.type() == 1 ? line.hourService() : null);
            item.setPrice(line.price());
            item.setDiscount(line.discount());
            budget.getItems().add(item);
        }
        return budget;
    }

    @Transactional(readOnly = true)
    public BudgetConcierge detail(Integer companyId, Integer resaleId, Integer id, String email) {
        User user = authorize(companyId, resaleId, email);
        var budget = budgets.findByCompanyIdAndResaleIdAndId(companyId, resaleId, id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Orcamento nao encontrado."));
        requireSalespersonAccess(user, budget.getSalespersonUserId(), LIST_BUDGET_ALL_SALESPERSON);
        return accessInfo(budget, user);
    }

    private BudgetConcierge editable(Integer companyId, Integer resaleId, Integer id) {
        var budget = budgets.lockBudget(companyId, resaleId, id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Orcamento nao encontrado."));
        if (budget.getStatus() != StatusBudgetEnum.OpenBudget && budget.getStatus() != StatusBudgetEnum.Approved)
            throw new BusinessException("Somente orcamentos abertos ou aprovados podem ser alterados.");
        return budget;
    }

    @Transactional
    public BudgetConcierge update(Integer companyId, Integer resaleId, Integer id, BudgetConciergeCreate data, String email) {
        User editor = authorize(companyId, resaleId, email);
        var budget = editable(companyId, resaleId, id);
        requireSalespersonAccess(editor, budget.getSalespersonUserId(), UPDATE_BUDGET_ALL_SALESPERSON);
        if (!Objects.equals(budget.getVehicleId(), data.vehicleId()))
            throw new BusinessException("A entrada vinculada ao orcamento nao pode ser alterada.");
        var draft = prepare(companyId, resaleId, data, editor, false);
        requireSalespersonAccess(editor, draft.getSalespersonUserId(), UPDATE_BUDGET_ALL_SALESPERSON);
        for(var document:documents.findByCompanyIdAndResaleIdAndBudgetId(companyId,resaleId,id)) { document.setShareTokenHash(null); document.setShareExpiresAt(null); document.setApprovedAt(null); documents.save(document); }
        budget.setStatus(StatusBudgetEnum.OpenBudget);
        budget.setDateAuthorization(null);
        budget.setDateValidation(draft.getDateValidation());
        budget.setInformation(draft.getInformation());
        budget.setPaymentTypeId(draft.getPaymentTypeId());
        budget.setPaymentTypeDesc(draft.getPaymentTypeDesc());
        budget.setClientCompanyId(draft.getClientCompanyId());
        budget.setClientCompanyName(draft.getClientCompanyName());
        budget.setSalespersonUserId(draft.getSalespersonUserId());
        budget.setSalespersonUserName(draft.getSalespersonUserName());
        budget.getItems().clear();
        for (var item : draft.getItems()) {
            item.setBudget(budget);
            budget.getItems().add(item);
        }
        return accessInfo(budgets.saveAndFlush(budget), editor);
    }

    @Transactional
    public BudgetConcierge cancel(Integer companyId, Integer resaleId, Integer id, String reason, String email) {
        User user = authorize(companyId, resaleId, email);
        if(reason==null || reason.isBlank() || reason.length()>1000) throw new BusinessException("Informe uma justificativa de ate 1000 caracteres para cancelar.");
        var budget = budgets.lockBudget(companyId,resaleId,id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Orcamento nao encontrado."));
        requireSalespersonAccess(user, budget.getSalespersonUserId(), UPDATE_BUDGET_ALL_SALESPERSON);
        if(budget.getStatus()!=StatusBudgetEnum.OpenBudget && budget.getStatus()!=StatusBudgetEnum.Approved) throw new BusinessException("O orcamento ja foi encerrado.");
        budget.setCancellationReason(reason.trim());
        budget.setStatus(StatusBudgetEnum.CancelledBudget);
        budget.getItems().size();
        return budgets.saveAndFlush(budget);
    }

    @Transactional
    public BudgetConcierge complete(Integer companyId, Integer resaleId, Integer id, String email) {
        User user = authorize(companyId, resaleId, email);
        var budget = budgets.lockBudget(companyId,resaleId,id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Orcamento nao encontrado."));
        requireSalespersonAccess(user, budget.getSalespersonUserId(), UPDATE_BUDGET_ALL_SALESPERSON);
        if(budget.getStatus()!=StatusBudgetEnum.Approved) throw new BusinessException("O orcamento precisa estar aprovado para ser concluido.");
        budget.setStatus(StatusBudgetEnum.CompleteBudget);
        budget.getItems().size();
        return budgets.saveAndFlush(budget);
    }

    @Transactional
    public BudgetConcierge documentScope(Integer companyId,Integer resaleId,Integer id,String email,boolean write) {
        User user = authorize(companyId,resaleId,email);
        var budget = write ? editable(companyId,resaleId,id) : budgets.findByCompanyIdAndResaleIdAndId(companyId,resaleId,id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Orcamento nao encontrado."));
        requireSalespersonAccess(user, budget.getSalespersonUserId(), write ? UPDATE_BUDGET_ALL_SALESPERSON : LIST_BUDGET_ALL_SALESPERSON);
        return budget;
    }
    void resetApproval(BudgetConcierge budget) {
        if(budget.getStatus()==StatusBudgetEnum.Approved) {
            budget.setStatus(StatusBudgetEnum.OpenBudget);
            budget.setDateAuthorization(null);
        }
    }
    private void validateNumber(java.math.BigDecimal value, int integers, int decimals, boolean positive) {
        if (value == null || (positive ? value.signum() <= 0 : value.signum() < 0) || value.stripTrailingZeros().scale() > decimals || value.compareTo(java.math.BigDecimal.TEN.pow(integers)) >= 0)
            throw new BusinessException("Quantidade, horas ou valores invalidos.");
    }
}
