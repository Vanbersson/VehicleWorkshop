package com.concierge.apiconcierge.services.notification.user;

import com.concierge.apiconcierge.dtos.notification.NotificationUserDto;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.notification.Notification;
import com.concierge.apiconcierge.models.notification.NotificationUser;

import java.util.List;

public interface INotificationUserService {
     MessageResponse save(NotificationUser n);

     MessageResponse delete(NotificationUserDto notification, String userEmail);

     List<Notification> filterUser(Integer companyId, Integer resaleId, Integer userId);

}
