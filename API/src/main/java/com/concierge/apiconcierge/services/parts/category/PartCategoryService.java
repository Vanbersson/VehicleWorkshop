package com.concierge.apiconcierge.services.parts.category;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.part.category.PartCategory;
import com.concierge.apiconcierge.repositories.parts.category.IPartCategoryRepository;
import com.concierge.apiconcierge.util.ConstantsMessage;
import com.concierge.apiconcierge.validation.parts.category.IPartCategoryValidation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PartCategoryService implements IPartCategoryService {
    @Autowired
    private IPartCategoryRepository repository;
    @Autowired
    private IPartCategoryValidation validation;

    @Override
    public MessageResponse save(PartCategory cat) {
        try {
            MessageResponse response = this.validation.save(cat);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                cat.setId(null);
                this.repository.save(cat);
            }
            return response;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public MessageResponse update(PartCategory cat) {
        try {
            MessageResponse response = this.validation.update(cat);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                this.repository.save(cat);
            }
            return response;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public List<PartCategory> listAll(Integer companyId, Integer resaleId) {
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
    public List<PartCategory> listAllEnabled(Integer companyId, Integer resaleId) {
        try {
            MessageResponse response = this.validation.listAll(companyId, resaleId);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                return this.repository.listAllEnabled(companyId, resaleId, StatusEnableDisable.Habilitado);
            }
            return List.of();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
