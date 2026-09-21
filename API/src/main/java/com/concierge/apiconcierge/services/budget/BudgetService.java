package com.concierge.apiconcierge.services.budget;

import com.concierge.apiconcierge.dtos.budget.BudgetNewDto;
import com.concierge.apiconcierge.exceptions.budget.BudgetException;
import com.concierge.apiconcierge.models.budget.Budget;
import com.concierge.apiconcierge.models.budget.BudgetToken;
import com.concierge.apiconcierge.models.budget.enums.StatusBudgetEnum;
import com.concierge.apiconcierge.models.vehicle.entry.VehicleEntry;
import com.concierge.apiconcierge.models.vehicle.enums.StepVehicleEnum;
import com.concierge.apiconcierge.repositories.budget.IBudgetRepository;
import com.concierge.apiconcierge.repositories.budget.IBudgetTokenRepository;
import com.concierge.apiconcierge.repositories.vehicle.entry.IVehicleEntryRepository;
import com.concierge.apiconcierge.util.ConstantsMessage;
import com.concierge.apiconcierge.validation.budget.BudgetValidation;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class BudgetService implements IBudgetService {

    @Autowired
    private IBudgetRepository repository;

    @Autowired
    IBudgetTokenRepository repositoryToken;

    @Autowired
    private BudgetValidation validation;

    @Autowired
    private IVehicleEntryRepository repositoryVehicleEntry;

    @SneakyThrows
    @Override
    public Integer save(BudgetNewDto budgetNewDto, String userLoginEmail) {
        Budget result;
        try {
            String message = this.validation.save(budgetNewDto, userLoginEmail);
            if (!ConstantsMessage.SUCCESS.equals(message))
                throw new BudgetException(message);

            VehicleEntry vehicleEntry = this.repositoryVehicleEntry.filterId(budgetNewDto.companyId(), budgetNewDto.resaleId(), budgetNewDto.vehicleEntryId());
            if (vehicleEntry == null)
                throw new BudgetException("Vehicle not found.");

            message = this.validation.save(vehicleEntry);

            if (ConstantsMessage.SUCCESS.equals(message)) {
                Budget budget = new Budget();
                budget.setCompanyId(vehicleEntry.getCompanyId());
                budget.setResaleId(vehicleEntry.getResaleId());
                budget.setStatus(StatusBudgetEnum.OpenBudget);
                budget.setDateGeneration(new Date());
                budget.setVehicleEntryId(vehicleEntry.getId());
                budget.setIdUserAttendant(vehicleEntry.getAttendantUserId());
                budget.setClientCompanyId(vehicleEntry.getClientCompanyId());
                budget.setTypePayment("");
                budget.setNameResponsible("");
                budget.setInformation("");
                result = this.repository.save(budget);

                //alterar o status da entrada de veículo
                //alterar o status do orçamento na entrada de veículo
                if (vehicleEntry.getStepEntry() == StepVehicleEnum.Attendant)
                    vehicleEntry.setStepEntry(StepVehicleEnum.Budget);

                this.repositoryVehicleEntry.save(vehicleEntry);
            } else {
                throw new BudgetException(message);
            }
        } catch (Exception ex) {
            throw new BudgetException(ex.getMessage());
        }
        return result.getId();
    }

    @SneakyThrows
    @Override
    public boolean update(Budget budget, String userEmail) {
        try {
            String message = this.validation.update(budget, userEmail);
            if (ConstantsMessage.SUCCESS.equals(message)) {
                this.repository.save(budget);


                BudgetToken token = this.repositoryToken.filterToken(budget.getCompanyId(), budget.getResaleId(), budget.getId());
                if(token != null){
                    token.setDateValid(budget.getDateValidation());
                    this.repositoryToken.save(token);
                }

                return true;
            } else {
                throw new BudgetException(message);
            }
        } catch (Exception ex) {
            throw new BudgetException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public String statusUpdate(Budget budget) {
        try {
            String message = this.validation.statusUpdate(budget);
            if (ConstantsMessage.SUCCESS.equals(message)) {

                Budget bud = this.repository.filterBudgetId(budget.getCompanyId(), budget.getResaleId(), budget.getId());
                bud.setStatus(budget.getStatus());
                this.repository.save(bud);

//                VehicleEntry veh = this.repositoryVehicleEntry.filterId(budget.getCompanyId(), budget.getResaleId(), budget.getVehicleEntryId());
//                veh.setBudgetStatus(budget.getStatus());
//                this.repositoryVehicleEntry.save(veh);

                return ConstantsMessage.SUCCESS;
            } else {
                throw new BudgetException(message);
            }
        } catch (Exception ex) {
            throw new BudgetException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public Budget filterId(Integer companyId, Integer resaleId, Integer budgetId) {
        try {
            String message = this.validation.filterBudgetId(companyId, resaleId, budgetId);
            if (ConstantsMessage.SUCCESS.equals(message)) {
                return this.repository.filterBudgetId(companyId, resaleId, budgetId);
            } else {
                throw new BudgetException(message);
            }
        } catch (Exception ex) {
            throw new BudgetException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public Map<String, Object> filterBudgetId(Integer companyId, Integer resaleId, Integer budgetId) {
        try {
            String message = this.validation.filterBudgetId(companyId, resaleId, budgetId);
            if (ConstantsMessage.SUCCESS.equals(message)) {
                Budget budget = this.repository.filterBudgetId(companyId, resaleId, budgetId);

                return this.loadBudget(budget);
            } else {
                throw new BudgetException(message);
            }
        } catch (Exception ex) {
            throw new BudgetException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public String openBudget(Budget budget) {
        try {
            String message = this.validation.openBudget(budget);
            if (ConstantsMessage.SUCCESS.equals(message)) {

                //update status vehicle
//                VehicleEntry vehicle = this.repositoryVehicleEntry.filterId(budget.getCompanyId(), budget.getResaleId(), budget.getVehicleEntryId());
//                vehicle.setBudgetStatus(StatusBudgetEnum.OpenBudget);
//                this.repositoryVehicleEntry.save(vehicle);

                //update status budget
                budget.setStatus(StatusBudgetEnum.OpenBudget);
                this.repository.save(budget);

                this.repositoryToken.deleteToken(budget.getCompanyId(), budget.getResaleId(), budget.getId());
                return ConstantsMessage.SUCCESS;
            } else {
                throw new BudgetException(message);
            }
        } catch (Exception ex) {
            throw new BudgetException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public String closeBudget(Budget budget) {
        try {
            String message = this.validation.closeBudget(budget);
            if (ConstantsMessage.SUCCESS.equals(message)) {
                //update status vehicle
//                VehicleEntry vehicle = this.repositoryVehicleEntry.filterVehicleId(budget.getCompanyId(), budget.getResaleId(), budget.getVehicleEntryId());
//                vehicle.setBudgetStatus(StatusBudgetEnum.CompleteBudget);
//                this.repositoryVehicleEntry.save(vehicle);

                //update status budget
                budget.setStatus(StatusBudgetEnum.CompleteBudget);
                this.repository.save(budget);
                return ConstantsMessage.SUCCESS;
            } else {
                throw new BudgetException(message);
            }
        } catch (Exception ex) {
            throw new BudgetException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public Map<String, Object> filterVehicleId(Integer companyId, Integer resaleId, Integer vehicleId, String userLoginEmail) {
        try {
            String message = this.validation.filterVehicleId(companyId, resaleId, vehicleId, userLoginEmail);
            if (ConstantsMessage.SUCCESS.equals(message)) {

                Budget budget = this.repository.filterVehicleId(companyId, resaleId, vehicleId);
                if (budget == null)
                    throw new BudgetException("Budget not found.");

                return this.loadBudget(budget);
            } else {
                throw new BudgetException(message);
            }
        } catch (Exception ex) {
            throw new BudgetException(ex.getMessage());
        }
    }

    private Map<String, Object> loadBudget(Budget budget) {

        Map<String, Object> map = new HashMap<>();
        map.put("companyId", budget.getCompanyId());
        map.put("resaleId", budget.getResaleId());
        map.put("id", budget.getId());
        map.put("vehicleEntryId", budget.getVehicleEntryId());
        map.put("status", budget.getStatus());
        map.put("dateGeneration", budget.getDateGeneration());
        if (budget.getDateValidation() == null) {
            map.put("dateValidation", "");
        } else {
            map.put("dateValidation", budget.getDateValidation());
        }
        if (budget.getDateAuthorization() == null) {
            map.put("dateAuthorization", "");
        } else {
            map.put("dateAuthorization", budget.getDateAuthorization());
        }
        map.put("nameResponsible", budget.getNameResponsible());
        map.put("typePayment", budget.getTypePayment());
        map.put("idUserAttendant", budget.getIdUserAttendant());
        map.put("clientCompanyId", budget.getClientCompanyId());
        map.put("information", budget.getInformation());
        if (budget.getClientSendDate() == null) {
            map.put("clientSendDate", "");
        } else {
            map.put("clientSendDate", budget.getClientSendDate());
        }
        if (budget.getClientApprovedDate() == null) {
            map.put("clientApprovedDate", "");
        } else {
            map.put("clientApprovedDate", budget.getClientApprovedDate());
        }

        return map;
    }

}
