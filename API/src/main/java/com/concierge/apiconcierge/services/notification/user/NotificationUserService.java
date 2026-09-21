package com.concierge.apiconcierge.services.notification.user;

import com.concierge.apiconcierge.dtos.notification.NotificationUserDto;
import com.concierge.apiconcierge.exceptions.notification.NotificationException;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.notification.Notification;
import com.concierge.apiconcierge.models.notification.NotificationUser;
import com.concierge.apiconcierge.models.user.User;
import com.concierge.apiconcierge.repositories.notification.INotificationUserRepository;
import com.concierge.apiconcierge.repositories.user.IUserRepository;
import com.concierge.apiconcierge.services.notification.notification.INotificationService;
import com.concierge.apiconcierge.util.ConstantsMessage;
import com.concierge.apiconcierge.validation.notification.user.INotificationUserValidation;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationUserService implements INotificationUserService {
    @Autowired
    private INotificationUserRepository repository;

    @Autowired
    private INotificationService notificationService;

    @Autowired
    private INotificationUserValidation validation;

    @Autowired
    private IUserRepository userRepository;

    @SneakyThrows
    @Override
    public MessageResponse save(NotificationUser n) {
        try {
            MessageResponse response = this.validation.save(n);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                n.setId(null);
                this.repository.save(n);
                return response;
            } else {
                return response;
            }
        } catch (Exception e) {
            throw new NotificationException(e.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse delete(NotificationUserDto no, String userEmail) {
        try {
            MessageResponse response = this.validation.delete(no, userEmail);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                User resultUser = this.userRepository.loginEmail(userEmail);
                this.repository.delete(no.companyId(), no.resaleId(), no.notificationId(), resultUser.getId());
                //Check if other users have this notification
                List<NotificationUser> resultList = this.repository.filterNotification(no.companyId(), no.resaleId(), no.notificationId());
                if (resultList.isEmpty()) {
                    //remove this notification if there are no users
                    this.notificationService.delete(no.companyId(), no.resaleId(), no.notificationId());
                }
            }
            return response;
        } catch (Exception e) {
            throw new NotificationException(e.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public List<Notification> filterUser(Integer companyId, Integer resaleId, Integer userId) {
        try {
            MessageResponse response = this.validation.filterUser(companyId, resaleId, userId);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                return this.notificationService.filterUser(companyId, resaleId, userId);
            }
            return List.of();
        } catch (Exception e) {
            throw new NotificationException(e.getMessage());
        }
    }

}
