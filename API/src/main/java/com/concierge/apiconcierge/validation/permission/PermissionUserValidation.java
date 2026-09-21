package com.concierge.apiconcierge.validation.permission;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.permission.PermissionUser;
import com.concierge.apiconcierge.util.ConstantsMessage;
import org.springframework.stereotype.Service;

@Service
public class PermissionUserValidation implements IPermissionUserValidation {
    @Override
    public MessageResponse save(PermissionUser permission) {
        MessageResponse response = new MessageResponse();
        if (permission.getCompanyId() == null || permission.getCompanyId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (permission.getResaleId() == null || permission.getResaleId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (permission.getUserId() == null || permission.getUserId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Usuário");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (permission.getPermissionId() == null || permission.getPermissionId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Permissão");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Permissão");
        response.setMessage("Cadastrada com sucesso.");
        return response;
    }

    @Override
    public MessageResponse update(PermissionUser permission) {
        MessageResponse response = new MessageResponse();
        if (permission.getCompanyId() == null || permission.getCompanyId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (permission.getResaleId() == null || permission.getResaleId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (permission.getId() == null ) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Código");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (permission.getUserId() == null || permission.getUserId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Usuário");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (permission.getPermissionId() == null || permission.getPermissionId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Permissão");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Permissão");
        response.setMessage("Atualizada com sucesso.");
        return response;
    }

    @Override
    public MessageResponse filterUser(Integer companyId, Integer resaleId, Integer userId) {
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
        if (userId == null || userId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Usuário");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Permissão");
        response.setMessage("Encontrada com sucesso.");
        return response;
    }

    @Override
    public MessageResponse filterPermission(Integer companyId, Integer resaleId, Integer userId, Integer permissionId) {
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
        if (userId == null || userId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Usuário");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (permissionId == null || permissionId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Permissão");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Permissão");
        response.setMessage("Encontrada com sucesso.");
        return response;
    }

    @Override
    public MessageResponse deleteAllUser(Integer companyId, Integer resaleId, Integer userId) {
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
        if (userId == null || userId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Usuário");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Permissão");
        response.setMessage("Excluída com sucesso.");
        return response;
    }
}
