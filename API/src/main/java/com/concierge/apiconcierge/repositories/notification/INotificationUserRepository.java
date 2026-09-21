package com.concierge.apiconcierge.repositories.notification;

import com.concierge.apiconcierge.models.notification.Notification;
import com.concierge.apiconcierge.models.notification.NotificationUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface INotificationUserRepository extends JpaRepository<NotificationUser, Integer> {



    @Query(value = "SELECT * FROM tb_notification_user WHERE company_id=?1 AND resale_id=?2 AND notification_id=?3",nativeQuery = true)
    List<NotificationUser>  filterNotification(Integer companyId, Integer resaleId, Integer notificationId);

    @Transactional
    @Modifying
    @Query(value = "DELETE FROM tb_notification_user WHERE company_id=?1 AND resale_id=?2 AND notification_id=?3 AND user_id=?4", nativeQuery = true)
    void delete(Integer companyId, Integer resaleId, Integer notificationId, Integer userId);

    @Transactional
    @Modifying
    @Query(value = "DELETE FROM tb_notification_user WHERE company_id=?1 AND resale_id=?2 AND user_id=?3", nativeQuery = true)
    void deleteAll(Integer companyId, Integer resaleId, Integer userId);
}
