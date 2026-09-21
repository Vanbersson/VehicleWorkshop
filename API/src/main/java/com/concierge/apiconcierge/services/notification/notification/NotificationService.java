package com.concierge.apiconcierge.services.notification.notification;

import com.concierge.apiconcierge.exceptions.notification.NotificationException;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.notification.Notification;
import com.concierge.apiconcierge.repositories.notification.INotificationRepository;
import com.concierge.apiconcierge.util.ConstantsMessage;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService implements INotificationService {
    @Autowired
    private INotificationRepository repository;

    @SneakyThrows
    @Override
    public Notification save(Notification n) {
        try {
            n.setId(null);
            return this.repository.save(n);
        } catch (Exception e) {
            throw new NotificationException(e.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse delete(Integer companyId, Integer resaleId, Integer id) {
        try {
            this.repository.delete(companyId, resaleId, id);
            MessageResponse response = new MessageResponse();
            response.setStatus(ConstantsMessage.SUCCESS);
            return response;
        } catch (Exception e) {
            throw new NotificationException(e.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public Notification filterId(Integer companyId, Integer resaleId, Integer id){
        try {
           return this.repository.filterId(companyId, resaleId, id);
        } catch (Exception e) {
            throw new NotificationException(e.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public List<Notification> filterUser(Integer companyId, Integer resaleId, Integer userId) {
        try {
            return this.repository.filterUser(companyId, resaleId, userId);
        } catch (Exception e) {
            throw new NotificationException(e.getMessage());
        }
    }

}
