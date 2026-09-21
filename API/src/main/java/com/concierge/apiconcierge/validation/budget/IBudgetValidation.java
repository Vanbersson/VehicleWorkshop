package com.concierge.apiconcierge.validation.budget;

import com.concierge.apiconcierge.dtos.budget.BudgetNewDto;
import com.concierge.apiconcierge.models.budget.Budget;
import com.concierge.apiconcierge.models.vehicle.entry.VehicleEntry;

public interface IBudgetValidation {
    public String save(BudgetNewDto budgetNewDto, String userLoginEmail);

    public String save(VehicleEntry vehicleEntry);

    public String update(Budget budget, String userLoginEmail);

    public String statusUpdate(Budget budget);

    public String filterBudgetId(Integer companyId, Integer resaleId, Integer budgetId);

    public String openBudget(Budget budget);
    public String closeBudget(Budget budget);

    public String filterVehicleId(Integer companyId, Integer resaleId, Integer vehicleId, String userLoginEmail);
}
