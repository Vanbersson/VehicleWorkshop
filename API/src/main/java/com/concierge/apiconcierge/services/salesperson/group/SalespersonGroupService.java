package com.concierge.apiconcierge.services.salesperson.group;

import com.concierge.apiconcierge.models.clientcompany.ClientCompanyRegion;
import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.salesperson.SalespersonGroup;
import com.concierge.apiconcierge.models.user.User;
import com.concierge.apiconcierge.repositories.salesperson.ISalespersonGroupRepository;
import com.concierge.apiconcierge.repositories.user.IUserRepository;
import com.concierge.apiconcierge.util.ConstantsMessage;
import com.concierge.apiconcierge.validation.salesperson.group.ISalespersonGroupValidation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SalespersonGroupService implements ISalespersonGroupService {

    @Autowired
    private IUserRepository repositoryUser;

    @Autowired
    private ISalespersonGroupRepository repository;

    @Autowired
    private ISalespersonGroupValidation validation;

    @Override
    public MessageResponse save(SalespersonGroup g, String emailUser) {
        try {
            MessageResponse response = this.validation.save(g);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                User resultUser = this.repositoryUser.loginEmail(emailUser);
                g.setCompanyId(resultUser.getCompanyId());
                g.setResaleId(resultUser.getResaleId());
                g.setId(null);
                SalespersonGroup resultSave = this.repository.save(g);
                response.setData(resultSave);
            }
            return response;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public MessageResponse update(SalespersonGroup g) {
        try {
            MessageResponse response = this.validation.update(g);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                SalespersonGroup resultSave = this.repository.save(g);
                response.setData(resultSave);
            }
            return response;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public List<SalespersonGroup> listAll(String emailUser) {
        try {
            User resultUser = this.repositoryUser.loginEmail(emailUser);
            return this.repository.listAll(resultUser.getCompanyId(), resultUser.getResaleId());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public List<SalespersonGroup> listAllEnabled(String emailUser) {
        try {
            User resultUser = this.repositoryUser.loginEmail(emailUser);
            return this.repository.listAllEnabled(resultUser.getCompanyId(), resultUser.getResaleId(), StatusEnableDisable.Habilitado);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
