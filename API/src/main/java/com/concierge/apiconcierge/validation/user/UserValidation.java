package com.concierge.apiconcierge.validation.user;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.user.User;
import com.concierge.apiconcierge.repositories.user.IUserRepository;
import com.concierge.apiconcierge.util.ConstantsMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class UserValidation implements IUserValidation {

    @Autowired
    IUserRepository repository;

    @Override
    public MessageResponse save(User user) {
        MessageResponse response = new MessageResponse();
        if (user.getCompanyId() == null || user.getCompanyId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (user.getResaleId() == null || user.getResaleId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (user.getStatus() == null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Status");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (user.getName().isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Nome");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (user.getPassword().isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Senha");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (user.getRoleId() == null || user.getRoleId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Cargo");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (user.getRoleDesc().isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Cargo");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (user.getRoleFunc() == null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Função");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (user.getEmail().isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("E-Mail");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (this.repository.filterEmail(user.getCompanyId(), user.getResaleId(), user.getEmail()) != null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Usuário");
            response.setMessage("E-Mail já cadastrado.");
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Usuário");
        response.setMessage("Cadastrado com sucesso.");
        return response;
    }

    @Override
    public MessageResponse update(User user) {
        MessageResponse response = new MessageResponse();
        if (user.getCompanyId() == null || user.getCompanyId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (user.getResaleId() == null || user.getResaleId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (user.getStatus() == null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Status");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (user.getId() == null || user.getId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Código");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (user.getName().isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Nome");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }

        if (user.getRoleId() == null || user.getRoleId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Cargo");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (user.getRoleDesc().isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Cargo");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (user.getRoleFunc() == null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Função");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (user.getEmail().isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("E-Mail");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Usuário");
        response.setMessage("Atualizado com sucesso.");
        return response;
    }

    @Override
    public MessageResponse listAll(Integer companyId, Integer resaleId) {
        MessageResponse response = new MessageResponse();
        if (companyId == null || companyId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (resaleId == null || resaleId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Usuários");
        response.setMessage("Encontrado com sucesso.");
        return response;
    }

    @Override
    public MessageResponse filterId(Integer companyId, Integer resaleId, Integer id) {
        MessageResponse response = new MessageResponse();
        if (companyId == null || companyId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (resaleId == null || resaleId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (id == null || id == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Código");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Usuário");
        response.setMessage("Encontrado com sucesso.");
        return response;
    }


    @Override
    public MessageResponse filterRoleId(Integer companyId, Integer resaleId, Integer roleId) {
        MessageResponse response = new MessageResponse();
        if (companyId == null || companyId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (resaleId == null || resaleId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (roleId == null || roleId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Cargo");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Usuário");
        response.setMessage("Encontrado com sucesso.");
        return response;
    }

    @Override
    public MessageResponse filterEmail(Integer companyId, Integer resaleId, String email) {
        MessageResponse response = new MessageResponse();
        if (companyId == null || companyId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (resaleId == null || resaleId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (email.isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("E-Mail");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Usuário");
        response.setMessage("Encontrado com sucesso.");
        return response;
    }
}
