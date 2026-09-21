package com.concierge.apiconcierge.services.notification.notification;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.notification.Notification;

import java.util.List;

public interface INotificationService {

    Notification save(Notification n);

    MessageResponse delete(Integer companyId, Integer resaleId, Integer id);

    Notification filterId(Integer companyId, Integer resaleId, Integer id);

    List<Notification> filterUser(Integer companyId, Integer resaleId, Integer userId);

}
