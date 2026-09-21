package com.concierge.apiconcierge.controllers.budget;

import com.concierge.apiconcierge.dtos.budget.BudgetTokenDto;
import com.concierge.apiconcierge.dtos.message.MessageResponseDto;
import com.concierge.apiconcierge.models.budget.*;
import com.concierge.apiconcierge.models.budget.enums.StatusBudgetEnum;
import com.concierge.apiconcierge.models.clientcompany.ClientCompany;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.repositories.budget.IBudgetTokenRepository;
import com.concierge.apiconcierge.services.budget.BudgetService;
import com.concierge.apiconcierge.services.budget.part.BudgetItemPartService;
import com.concierge.apiconcierge.services.budget.requisition.BudgetItemRequisitionService;
import com.concierge.apiconcierge.services.budget.service.BudgetItemServiceService;
import com.concierge.apiconcierge.services.clientcompany.ClientCompanyService;
import com.concierge.apiconcierge.services.vehicle.entry.VehicleEntryService;
import com.concierge.apiconcierge.util.ConstantsMessage;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

@RestController
@RequestMapping("/vehicle/entry/budget/token")
public class BudgetTokenController {

    @Autowired
    IBudgetTokenRepository repository;

    @Autowired
    private BudgetService budgetService;
    @Autowired
    BudgetItemRequisitionService budgetItemRequisitionService;
    @Autowired
    private BudgetItemServiceService budgetItemServiceService;
    @Autowired
    private BudgetItemPartService budgetItemPartService;

    @Autowired
    private ClientCompanyService clientCompanyService;
    @Autowired
    private VehicleEntryService vehicleEntryService;


    @PostMapping("/new")
    public ResponseEntity<Object> newToken(@RequestBody BudgetTokenDto data) {
        try {
            BudgetToken resultToken = this.repository.filterToken(data.companyId(), data.resaleId(), data.budgetId());
            if (resultToken != null)
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ConstantsMessage.ERROR_BUDGET_EXISTS));

            BudgetToken token = new BudgetToken();
            BeanUtils.copyProperties(data, token);
            token = this.repository.save(token);

            return ResponseEntity.status(HttpStatus.CREATED).body(token);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @PostMapping("/delete")
    public ResponseEntity<Object> deleteToken(@RequestBody BudgetTokenDto data) {
        try {
            this.repository.deleteToken(data.companyId(), data.resaleId(), data.budgetId());
            return ResponseEntity.status(HttpStatus.OK).body(ConstantsMessage.SUCCESS);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @PostMapping("/filter")
    public ResponseEntity<Object> filterToken(@RequestBody BudgetTokenDto data) {
        try {
            BudgetToken token = this.repository.filterToken(data.companyId(), data.resaleId(), data.budgetId());
            return ResponseEntity.status(HttpStatus.OK).body(token);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/valid/{token}")
    public ResponseEntity<Object> validToken(@PathVariable(value = "token") UUID id) {
        try {
            Optional<BudgetToken> resultToken = this.repository.findById(id);
            if (resultToken.isEmpty())
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ConstantsMessage.ERROR));

            BudgetToken token = resultToken.get();

            LocalDate today = LocalDate.now();
            LocalDate validDate = token.getDateValid().toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDate();

            if (validDate.isBefore(today))
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ConstantsMessage.ERROR));

            Map<String, Object> budget = this.budgetService.filterBudgetId(token.getCompanyId(), token.getResaleId(), token.getBudgetId());
            if (budget.get("status") != StatusBudgetEnum.PendingApproval) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto("Not found."));
            }

            List<BudgetItemRequisition> listReq = this.budgetItemRequisitionService.listAllRequisition(token.getCompanyId(), token.getResaleId(), token.getBudgetId());

            List<BudgetItemService> listSer = this.budgetItemServiceService.listAllServices(token.getCompanyId(), token.getResaleId(), token.getBudgetId());

            List<BudgetItemPart> listParts = this.budgetItemPartService.listAllParts(token.getCompanyId(), token.getResaleId(), token.getBudgetId());

            MessageResponse response = this.clientCompanyService.filterId(token.getCompanyId(), token.getResaleId(), Integer.parseInt(budget.get("clientCompanyId").toString()));
            ClientCompany client = (ClientCompany) response.getData();

           MessageResponse vehicle = this.vehicleEntryService.filterId(token.getCompanyId(), token.getResaleId(), Integer.parseInt(budget.get("vehicleEntryId").toString()));

            Map<String, Object> complete = new HashMap<>();
            complete.put("Budget", budget);
            complete.put("BudgetItemRequisition", listReq);
            complete.put("BudgetItemService", listSer);
            complete.put("BudgetItemPart", listParts);
            complete.put("Client", client);
            complete.put("Vehicle", vehicle.getData());

            return ResponseEntity.status(HttpStatus.OK).body(complete);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @PostMapping("/approbation")
    public ResponseEntity<Object> approbation(@RequestBody BudgetTokenDto data) {
        try {
            Optional<BudgetToken> resultToken = this.repository.findById(data.id());

            BudgetToken token = resultToken.get();

            Budget budget = this.budgetService.filterId(token.getCompanyId(), token.getResaleId(), token.getBudgetId());
            if (budget == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto("Not found."));
            }

            if (budget.getStatus() != StatusBudgetEnum.PendingApproval) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto("Not found."));
            }

            budget.setStatus(StatusBudgetEnum.Approved);
            this.budgetService.statusUpdate(budget);

            //Remover o token
            this.repository.deleteToken(budget.getCompanyId(), budget.getResaleId(), budget.getId());

            return ResponseEntity.status(HttpStatus.OK).body(new MessageResponseDto(ConstantsMessage.SUCCESS));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }


}
