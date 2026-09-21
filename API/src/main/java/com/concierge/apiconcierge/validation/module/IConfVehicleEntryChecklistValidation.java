package com.concierge.apiconcierge.validation.module;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.module.ConfVehicleEntryChecklist;

public interface IConfVehicleEntryChecklistValidation {
    public MessageResponse update(ConfVehicleEntryChecklist mod);

    public MessageResponse filterCompanyResale(Integer companyId, Integer resaleId);
}
