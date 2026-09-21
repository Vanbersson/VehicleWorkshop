package com.concierge.apiconcierge.services.module;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.module.ConfVehicleEntryChecklist;

public interface IConfVehicleEntryChecklistService {

    public MessageResponse update(ConfVehicleEntryChecklist mod);

    public MessageResponse filterCompanyResale(Integer companyId, Integer resaleId);
}
