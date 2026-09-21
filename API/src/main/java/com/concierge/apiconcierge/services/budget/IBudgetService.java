package com.concierge.apiconcierge.services.budget;

import com.concierge.apiconcierge.dtos.budget.BudgetNewDto;
import com.concierge.apiconcierge.models.budget.Budget;

import java.util.Map;

public interface IBudgetService {

    public Integer save(BudgetNewDto budget, String userLoginEmail);

    public boolean update(Budget budget, String userLoginEmail);

    public String statusUpdate(Budget budget);
    public Budget filterId(Integer companyId, Integer resaleId, Integer budgetId);

    public Map<String, Object> filterBudgetId(Integer companyId, Integer resaleId, Integer budgetId);

    public String openBudget(Budget budget);
    public String closeBudget(Budget budget);

    public Map<String, Object> filterVehicleId(Integer companyId, Integer resaleId, Integer vehicleId, String userLoginEmail);
}
