package com.concierge.apiconcierge.repositories.notification;

import com.concierge.apiconcierge.models.notification.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface INotificationRepository extends JpaRepository<Notification, Integer> {
    @Query(value = "SELECT DISTINCT tbn.company_id, tbn.resale_id, tbn.id, tbn.orig_user_id, tbn.orig_user_name, tbn.orig_date, tbn.orig_role_id, tbn.orig_role_desc, tbn.orig_notification_menu,  tbn.orig_id,tbn.header, tbn.message1, tbn.message2, tbn.message3 FROM tb_notification_user AS tbnu \n" +
            "INNER JOIN tb_notification AS tbn ON tbnu.company_id = tbn.company_id AND tbnu.resale_id = tbn.resale_id AND tbnu.notification_id = tbn.id \n" +
            "WHERE tbnu.company_id = ?1 AND tbnu.resale_id = ?2 AND tbnu.user_id = ?3 ORDER BY tbn.orig_date DESC", nativeQuery = true)
    List<Notification> filterUser(Integer companyId, Integer resaleId, Integer userId);

    @Transactional
    @Modifying
    @Query(value = "DELETE FROM tb_notification WHERE company_id=?1 AND resale_id=?2 AND id=?3", nativeQuery = true)
    void delete(Integer companyId, Integer resaleId, Integer id);

    @Query(value = "SELECT * FROM tb_notification WHERE company_id=?1 AND resale_id=?2 AND id=?3",nativeQuery = true)
    Notification filterId(Integer companyId, Integer resaleId, Integer id);
}
