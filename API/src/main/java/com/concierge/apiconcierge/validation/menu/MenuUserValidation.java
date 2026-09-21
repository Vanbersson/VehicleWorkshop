package com.concierge.apiconcierge.validation.menu;

import com.concierge.apiconcierge.models.menu.MenuUser;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.util.ConstantsMessage;
import org.springframework.stereotype.Service;

@Service
public class MenuUserValidation implements IMenuUserValidation {

    @Override
    public MessageResponse save(MenuUser menu) {
        MessageResponse response = new MessageResponse();
        if (menu.getCompanyId() == null || menu.getCompanyId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (menu.getResaleId() == null || menu.getResaleId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (menu.getMenuId().isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Menu");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (menu.getUserId() == null || menu.getUserId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Usuário");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Menu");
        response.setMessage("Cadastrado com sucesso.");
        return response;
    }

    @Override
    public MessageResponse update(MenuUser menu) {
        MessageResponse response = new MessageResponse();
        if (menu.getCompanyId() == null || menu.getCompanyId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (menu.getResaleId() == null || menu.getResaleId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (menu.getId() == null ) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Código");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (menu.getMenuId().isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Menu");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (menu.getUserId() == null || menu.getUserId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Usuário");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Menu");
        response.setMessage("Atualizado com sucesso.");
        return response;
    }

    @Override
    public MessageResponse filterMenus(MenuUser menu) {
        MessageResponse response = new MessageResponse();
        if (menu.getCompanyId() == null || menu.getCompanyId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (menu.getResaleId() == null || menu.getResaleId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (menu.getUserId() == null || menu.getUserId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Usuário");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Menu");
        response.setMessage("Encontrado com sucesso.");
        return response;
    }

    @Override
    public MessageResponse deleteMenus(MenuUser menu) {
        MessageResponse response = new MessageResponse();
        if (menu.getCompanyId() == null || menu.getCompanyId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (menu.getResaleId() == null || menu.getResaleId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (menu.getUserId() == null || menu.getUserId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Usuário");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Menu");
        response.setMessage("Excluído com sucesso.");
        return response;
    }
}
