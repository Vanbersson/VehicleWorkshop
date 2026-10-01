package com.concierge.apiconcierge.services.clientcompany.region;

import com.concierge.apiconcierge.models.clientcompany.ClientCompanyRegion;
import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.user.User;
import com.concierge.apiconcierge.repositories.clientcompany.IClientCompanyRegionRepository;
import com.concierge.apiconcierge.repositories.user.IUserRepository;
import com.concierge.apiconcierge.util.ConstantsMessage;
import com.concierge.apiconcierge.validation.clientcompany.region.IClientCompanyRegionValidation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClientCompanyRegionService implements IClientCompanyRegionService {
    @Autowired
    private IUserRepository repositoryUser;
    @Autowired
    private IClientCompanyRegionRepository repository;
    @Autowired
    private IClientCompanyRegionValidation validation;

    @Override
    public MessageResponse save(ClientCompanyRegion r, String emailUser) {
        try {
            MessageResponse response = this.validation.save(r);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                User resultUser = this.repositoryUser.loginEmail(emailUser);
                r.setCompanyId(resultUser.getCompanyId());
                r.setResaleId(resultUser.getResaleId());
                r.setId(null);
                ClientCompanyRegion resultSave = this.repository.save(r);
                response.setData(resultSave);
            }
            return response;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public MessageResponse update(ClientCompanyRegion r) {
        try {
            MessageResponse response = this.validation.update(r);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                this.repository.save(r);
            }
            return response;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public List<ClientCompanyRegion> listAll(String emailUser) {
        try {
            User resultUser = this.repositoryUser.loginEmail(emailUser);
            return this.repository.listAll(resultUser.getCompanyId(), resultUser.getResaleId());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public List<ClientCompanyRegion> listAllEnabled(String emailUser) {
        try {
            User resultUser = this.repositoryUser.loginEmail(emailUser);
            return this.repository.listAllEnabled(resultUser.getCompanyId(), resultUser.getResaleId(), StatusEnableDisable.Habilitado);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
