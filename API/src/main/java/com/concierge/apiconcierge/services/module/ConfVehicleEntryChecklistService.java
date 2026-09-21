package com.concierge.apiconcierge.services.module;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.module.ConfVehicleEntryChecklist;
import com.concierge.apiconcierge.repositories.module.IConfVehicleEntryChecklistRepository;
import com.concierge.apiconcierge.util.ConstantsMessage;
import com.concierge.apiconcierge.validation.module.IConfVehicleEntryChecklistValidation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ConfVehicleEntryChecklistService implements IConfVehicleEntryChecklistService {
    @Autowired
    private IConfVehicleEntryChecklistRepository repository;

    @Autowired
    private IConfVehicleEntryChecklistValidation validation;

    @Override
    public MessageResponse update(ConfVehicleEntryChecklist mod) {
        try {
            MessageResponse response = this.validation.update(mod);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                ConfVehicleEntryChecklist result = this.repository.save(mod);
                response.setData(result);
            }
            return response;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public MessageResponse filterCompanyResale(Integer companyId, Integer resaleId) {
        try {
            MessageResponse response = this.validation.filterCompanyResale(companyId, resaleId);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                ConfVehicleEntryChecklist result = this.repository.filterCompanyResale(companyId, resaleId);
                response.setData(result);
            }
            return response;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
