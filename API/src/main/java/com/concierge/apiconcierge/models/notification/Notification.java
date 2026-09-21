package com.concierge.apiconcierge.models.notification;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")

@Entity
@Table(name = "tb_notification")
public class Notification {

    @Column(name = "company_id")
    private Integer companyId;

    @Column(name = "resale_id")
    private Integer resaleId;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "orig_user_id")
    private Integer origUserId;

    @Column(name = "orig_user_name")
    private String origUserName;

    @Column(name = "orig_date")
    private Date origDate;

    @Column(name = "orig_role_id")
    private Integer origRoleId;

    @Column(name = "orig_role_desc")
    private String origRoleDesc;

    @Column(name = "orig_notification_menu")
    private NotificationMenu origNotificationMenu;

    @Column(name = "orig_id")
    private String origId;

    private String header;

    private String message1;

    private String message2;

    private String message3;
}
