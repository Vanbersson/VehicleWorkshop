package com.concierge.apiconcierge.validation.notification.user;

import com.concierge.apiconcierge.dtos.notification.NotificationUserDto;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.notification.NotificationUser;

public interface INotificationUserValidation {
    public MessageResponse save(NotificationUser n);

    public MessageResponse delete(NotificationUserDto notification, String userEmail);

    public MessageResponse deleteAll(NotificationUserDto notification, String userEmail);

    public MessageResponse filterUser(Integer companyId, Integer resaleId, Integer userId);
}
