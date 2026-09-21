package com.concierge.apiconcierge.services.parts.group;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.part.group.GroupPart;
import com.concierge.apiconcierge.repositories.parts.group.IGroupPartRepository;
import com.concierge.apiconcierge.util.ConstantsMessage;
import com.concierge.apiconcierge.validation.parts.group.IGroupPartValidation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GroupPartService implements IGroupPartService {
    @Autowired
    private IGroupPartRepository repository;
    @Autowired
    private IGroupPartValidation validation;

    @Override
    public MessageResponse save(GroupPart g) {
        try {
            MessageResponse response = this.validation.save(g);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                g.setId(null);
                this.repository.save(g);
            }
            return response;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public MessageResponse update(GroupPart g) {
        try {
            MessageResponse response = this.validation.update(g);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                this.repository.save(g);
            }
            return response;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public List<GroupPart> listAll(Integer companyId, Integer resaleId) {
        try {
            MessageResponse response = this.validation.listAll(companyId, resaleId);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                return this.repository.listAll(companyId, resaleId);
            }
            return List.of();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public List<GroupPart> filterBrand(Integer companyId, Integer resaleId, Integer brandId) {
        try {
            MessageResponse response = this.validation.filterBrand(companyId, resaleId, brandId);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                return this.repository.filterBrand(companyId, resaleId, StatusEnableDisable.Habilitado, brandId);
            }
            return List.of();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
