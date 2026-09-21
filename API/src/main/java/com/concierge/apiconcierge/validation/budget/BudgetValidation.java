package com.concierge.apiconcierge.validation.budget;

import com.concierge.apiconcierge.dtos.budget.BudgetNewDto;
import com.concierge.apiconcierge.models.budget.Budget;
import com.concierge.apiconcierge.models.budget.enums.StatusBudgetEnum;
import com.concierge.apiconcierge.models.enums.YesNot;
import com.concierge.apiconcierge.models.permission.PermissionUser;
import com.concierge.apiconcierge.models.user.User;
import com.concierge.apiconcierge.models.vehicle.entry.VehicleEntry;
import com.concierge.apiconcierge.repositories.budget.IBudgetRepository;
import com.concierge.apiconcierge.repositories.permission.IPermissionUserRepository;
import com.concierge.apiconcierge.repositories.user.IUserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.concierge.apiconcierge.util.ConstantsMessage;
import com.concierge.apiconcierge.util.ConstantsPermission;

import static com.concierge.apiconcierge.util.ConstantsMessage.ERROR_PERMISSION;

@Service
public class BudgetValidation implements IBudgetValidation {

    @Autowired
    private IBudgetRepository repository;

    @Autowired
    IUserRepository userRepository;

    @Autowired
    IPermissionUserRepository permissionUser;

    @Override
    public String save(BudgetNewDto budgetNewDto, String userLoginEmail) {
        if (budgetNewDto.companyId() == null || budgetNewDto.companyId() == 0)
            return ConstantsMessage.ERROR_COMPANY;
        if (budgetNewDto.resaleId() == null || budgetNewDto.resaleId() == 0)
            return ConstantsMessage.ERROR_RESALE;
        if (budgetNewDto.vehicleEntryId() == null || budgetNewDto.vehicleEntryId() == 0)
            return ConstantsMessage.ERROR_VEHICLE_ID;
        if (userLoginEmail.isBlank())
            return ConstantsMessage.ERROR;

        User user = this.userRepository.filterEmail(budgetNewDto.companyId(), budgetNewDto.resaleId(), userLoginEmail);
        if (user == null)
            return ConstantsMessage.ERROR;

        if (user.getId() != 1) {
            PermissionUser permission = this.permissionUser.findPermissionId(budgetNewDto.companyId(), budgetNewDto.companyId(), user.getId(), ConstantsPermission.BUDGET_NEW);
            if (permission == null)
                return ConstantsMessage.ERROR_PERMISSION;
        }

        return ConstantsMessage.SUCCESS;
    }

    @Override
    public String save(VehicleEntry vehicle) {
//        if (vehicle.getBudgetStatus() != StatusBudgetEnum.NotBudget)
//            return ConstantsMessage.ERROR_BUDGET_EXISTS;
//        if (vehicle.getIdUserAttendant() == null || vehicle.getIdUserAttendant() == 0 || vehicle.getNameUserAttendant().isBlank())
//            return ConstantsMessage.ERROR_ATTENDANT;
//        if (vehicle.getClientCompanyId() == null || vehicle.getClientCompanyId() == 0 || vehicle.getClientCompanyName().isBlank())
//            return ConstantsMessage.ERROR_CLIENTCOMPANY;
//        if (vehicle.getServiceOrder() == YesNot.not)
//            return ConstantsMessage.ERROR_SERVICE_ORDER_NOT;
//        if (vehicle.getNumServiceOrder().isBlank())
//            return ConstantsMessage.ERROR_VEHICLE_NUMBER_O_S;

        return ConstantsMessage.SUCCESS;
    }

    @Override
    public String update(Budget budget, String userLoginEmail) {

        if (budget.getCompanyId() == null || budget.getCompanyId() == 0)
            return ConstantsMessage.ERROR_COMPANY;
        if (budget.getResaleId() == null || budget.getResaleId() == 0)
            return ConstantsMessage.ERROR_RESALE;
        if (budget.getId() == null || budget.getId() == 0)
            return ConstantsMessage.ERROR_ID;
        if (budget.getVehicleEntryId() == null || budget.getVehicleEntryId() == 0)
            return ConstantsMessage.ERROR_VEHICLE_ID;
        if (budget.getStatus() == null)
            return ConstantsMessage.ERROR_STATUS;
        if (budget.getDateGeneration() == null)
            return ConstantsMessage.ERROR_DATE_GENERATION;
        if (budget.getNameResponsible().isBlank())
            return ConstantsMessage.ERROR_NAME_RESPONSIBLE;
        if (budget.getIdUserAttendant() == null || budget.getIdUserAttendant() == 0)
            return ConstantsMessage.ERROR_ATTENDANT;
        if (budget.getClientCompanyId() == null || budget.getClientCompanyId() == 0)
            return ConstantsMessage.ERROR_CLIENTCOMPANY;

        User user = this.userRepository.filterEmail(budget.getCompanyId(), budget.getResaleId(), userLoginEmail);
        if (user.getId() != 1) {
            PermissionUser permission = this.permissionUser.findPermissionId(budget.getCompanyId(), budget.getResaleId(), user.getId(), ConstantsPermission.BUDGET_UPDATE);
            if (permission == null)
                return ConstantsMessage.ERROR_PERMISSION;
        }

        return ConstantsMessage.SUCCESS;
    }
    @Override
    public String statusUpdate(Budget budget){
        if (budget.getCompanyId() == null || budget.getCompanyId() == 0)
            return ConstantsMessage.ERROR_COMPANY;
        if (budget.getResaleId() == null || budget.getResaleId() == 0)
            return ConstantsMessage.ERROR_RESALE;
        if (budget.getId() == null || budget.getId() == 0)
            return ConstantsMessage.ERROR_ID;
        if (budget.getStatus() == null)
            return ConstantsMessage.ERROR_STATUS;

        return ConstantsMessage.SUCCESS;
    }

    @Override
    public String filterBudgetId(Integer companyId, Integer resaleId, Integer budgetId) {
        if (companyId == null || companyId == 0)
            return ConstantsMessage.ERROR_COMPANY;
        if (resaleId == null || resaleId == 0)
            return ConstantsMessage.ERROR_RESALE;
        if (budgetId == null || budgetId == 0)
            return ConstantsMessage.ERROR_ID;

        return ConstantsMessage.SUCCESS;
    }

    @Override
    public String openBudget(Budget budget) {
        if (budget.getCompanyId() == null || budget.getCompanyId() == 0)
            return ConstantsMessage.ERROR_COMPANY;
        if (budget.getResaleId() == null || budget.getResaleId() == 0)
            return ConstantsMessage.ERROR_RESALE;
        if (budget.getId() == null || budget.getId() == 0)
            return ConstantsMessage.ERROR_ID;
        if (budget.getVehicleEntryId() == null || budget.getVehicleEntryId() == 0)
            return ConstantsMessage.ERROR_VEHICLE_ID;
        if (budget.getStatus() == null)
            return ConstantsMessage.ERROR_STATUS;
        if (budget.getStatus() != StatusBudgetEnum.OpenBudget)
            return ConstantsMessage.ERROR_STATUS_DIFFERENT;
        if (budget.getDateGeneration() == null)
            return ConstantsMessage.ERROR_DATE_GENERATION;
        if (budget.getNameResponsible().isBlank())
            return ConstantsMessage.ERROR_NAME_RESPONSIBLE;
        if (budget.getIdUserAttendant() == null || budget.getIdUserAttendant() == 0)
            return ConstantsMessage.ERROR_ATTENDANT;
        if (budget.getClientCompanyId() == null || budget.getClientCompanyId() == 0)
            return ConstantsMessage.ERROR_CLIENTCOMPANY;

        return ConstantsMessage.SUCCESS;
    }

    @Override
    public String closeBudget(Budget budget) {
        if (budget.getCompanyId() == null || budget.getCompanyId() == 0)
            return ConstantsMessage.ERROR_COMPANY;
        if (budget.getResaleId() == null || budget.getResaleId() == 0)
            return ConstantsMessage.ERROR_RESALE;
        if (budget.getId() == null || budget.getId() == 0)
            return ConstantsMessage.ERROR_ID;
        if (budget.getVehicleEntryId() == null || budget.getVehicleEntryId() == 0)
            return ConstantsMessage.ERROR_VEHICLE_ID;
        if (budget.getStatus() == null)
            return ConstantsMessage.ERROR_STATUS;
        if (budget.getStatus() != StatusBudgetEnum.CompleteBudget)
            return ConstantsMessage.ERROR_STATUS_DIFFERENT;
        if (budget.getDateGeneration() == null)
            return ConstantsMessage.ERROR_DATE_GENERATION;
        if (budget.getNameResponsible().isBlank())
            return ConstantsMessage.ERROR_NAME_RESPONSIBLE;
        if (budget.getIdUserAttendant() == null || budget.getIdUserAttendant() == 0)
            return ConstantsMessage.ERROR_ATTENDANT;
        if (budget.getClientCompanyId() == null || budget.getClientCompanyId() == 0)
            return ConstantsMessage.ERROR_CLIENTCOMPANY;

        return ConstantsMessage.SUCCESS;
    }


    @Override
    public String filterVehicleId(Integer companyId, Integer resaleId, Integer vehicleId, String userLoginEmail) {
        if (companyId == null || companyId == 0)
            return ConstantsMessage.ERROR_COMPANY;
        if (resaleId == null || resaleId == 0)
            return ConstantsMessage.ERROR_RESALE;
        if (vehicleId == null || vehicleId == 0)
            return ConstantsMessage.ERROR_VEHICLE_ID;

        //Permission
        User user = this.userRepository.filterEmail(companyId, resaleId, userLoginEmail);
        if (user.getId() != 1) {
            PermissionUser permission = this.permissionUser.findPermissionId(companyId, resaleId, user.getId(), ConstantsPermission.BUDGET_SHOW);
            if (permission == null)
                return ERROR_PERMISSION;
        }

        return ConstantsMessage.SUCCESS;
    }
}
