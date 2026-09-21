package com.concierge.apiconcierge.validation.notification.user;

import com.concierge.apiconcierge.dtos.notification.NotificationUserDto;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.notification.NotificationUser;
import com.concierge.apiconcierge.util.ConstantsMessage;
import org.springframework.stereotype.Service;

@Service
public class NotificationUserValidation implements INotificationUserValidation {
    @Override
    public MessageResponse save(NotificationUser n) {
        MessageResponse response = new MessageResponse();
        if (n.getCompanyId() == null || n.getCompanyId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (n.getResaleId() == null || n.getResaleId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (n.getNotificationId() == null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Notificação");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (n.getUserId() == null || n.getUserId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Usuário");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Notificação");
        response.setMessage("Criada com sucesso.");
        return response;
    }

    @Override
    public MessageResponse delete(NotificationUserDto notification, String userEmail) {
        MessageResponse response = new MessageResponse();
        if (notification.companyId() == null || notification.companyId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (notification.resaleId() == null || notification.resaleId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (notification.notificationId() == null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Notificação");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (userEmail.isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("E-Mail Usuário");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Notificação");
        response.setMessage("Removida com sucesso.");
        return response;
    }

    @Override
    public MessageResponse deleteAll(NotificationUserDto notification, String userEmail) {
        MessageResponse response = new MessageResponse();
        if (notification.companyId() == null || notification.companyId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (notification.resaleId() == null || notification.resaleId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (userEmail.isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("E-Mail Usuário");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Notificações");
        response.setMessage("Removida com sucesso.");
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
        response.setHeader("Notificações");
        response.setMessage("Encontrada com sucesso.");
        return response;
    }
}
