package com.concierge.apiconcierge.dtos.vehicle.entry;

import com.concierge.apiconcierge.models.budget.enums.StatusBudgetEnum;
import com.concierge.apiconcierge.models.enums.YesNot;
import com.concierge.apiconcierge.models.vehicle.enums.StatusAuthExitEnum;

import java.util.Date;

public record VehicleEntryListDto(
        Integer id,
        String placa,
        YesNot vehicleNew,
        String frota,
        String modelDescription,
        Date dateEntry,
        String nameUserAttendant,
        String clientCompanyName,
        StatusBudgetEnum budgetStatus,
        StatusAuthExitEnum statusAuthExit) {
}
