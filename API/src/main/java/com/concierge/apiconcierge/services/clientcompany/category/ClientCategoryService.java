package com.concierge.apiconcierge.services.clientcompany.category;

import com.concierge.apiconcierge.exceptions.clientcompany.ClientCompanyException;
import com.concierge.apiconcierge.models.clientcompany.ClientCategory;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.repositories.clientcompany.IClientCategoryRepository;
import com.concierge.apiconcierge.util.ConstantsMessage;
import com.concierge.apiconcierge.validation.clientcompany.category.IClientCategoryValidation;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClientCategoryService implements IClientCategoryService {

    @Autowired
    private IClientCategoryRepository repository;

    @Autowired
    private IClientCategoryValidation validation;

    @SneakyThrows
    @Override
    public MessageResponse save(ClientCategory cat) {
        try {
            MessageResponse response = this.validation.save(cat);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                cat.setId(null);
                ClientCategory result = this.repository.save(cat);
                response.setData(result);
            }
            return response;
        } catch (Exception e) {
            throw new ClientCompanyException(e.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse update(ClientCategory cat) {
        try {
            MessageResponse response = this.validation.update(cat);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                ClientCategory result = this.repository.save(cat);
                response.setData(result);
            }
            return response;
        } catch (Exception e) {
            throw new ClientCompanyException(e.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse listAll(Integer companyId, Integer resaleId) {
        try {
            MessageResponse response = this.validation.listAll(companyId, resaleId);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                List<ClientCategory> list = this.repository.listAll(companyId, resaleId);
                response.setData(list);
            }
            return response;
        } catch (Exception e) {
            throw new ClientCompanyException(e.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse listAllStatus(Integer companyId, Integer resaleId, StatusEnableDisable status) {
        try {
            MessageResponse response = this.validation.listAll(companyId, resaleId);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                List<ClientCategory> list = this.repository.listAllStatus(companyId, resaleId, status);
                response.setData(list);
            }
            return response;
        } catch (Exception e) {
            throw new ClientCompanyException(e.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse filterId(Integer companyId, Integer resaleId, Integer id) {
        try {
            MessageResponse response = this.validation.filterId(companyId, resaleId, id);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                ClientCategory result = this.repository.filterId(companyId, resaleId, id);
                response.setData(result);
            }
            return response;
        } catch (Exception e) {
            throw new ClientCompanyException(e.getMessage());
        }
    }
}
