package com.concierge.apiconcierge.models.purchase;

import com.concierge.apiconcierge.models.purchase.statusEnum.PurchaseOrderStatus;
import com.concierge.apiconcierge.models.purchase.statusEnum.TypePurchaseOrder;
import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "tb_purchase_order")
public class PurchaseOrder {

    @Column(name = "company_id")
    private Integer companyId;

    @Column(name = "resale_id")
    private Integer resaleId;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private PurchaseOrderStatus status;

    private TypePurchaseOrder type;

    @Column(name = "generation_user_id")
    private Integer generationUserId;

    @Column(name = "generation_user_name")
    private String generationUserName;

    @Column(name = "generation_date")
    private Date generationDate;

    @Column(name = "responsible_user_id")
    private Integer responsibleUserId;

    @Column(name = "responsible_user_name")
    private String responsibleUserName;

    @Column(name = "payment_type_id")
    private Integer paymentTypeId;

    @Column(name = "payment_type_desc")
    private String paymentTypeDesc;

    @Column(name = "date_delivery")
    private Date dateDelivery;

    @Column(name = "date_received")
    private Date dateReceived;

    private String information;

    @Column(name = "client_company_id")
    private Integer clientCompanyId;

    @Column(name = "client_company_name")
    private String clientCompanyName;

    @Column(name = "attendant_name")
    private String attendantName;

    @Column(name = "attendant_email")
    private String attendantEmail;

    @Column(name = "attendant_ddd_cellphone")
    private String attendantDddCellphone;

    @Column(name = "attendant_cellphone")
    private String attendantCellphone;

    @Column(name = "attendant_ddd_phone")
    private String attendantDddPhone;

    @Column(name = "attendant_phone")
    private String attendantPhone;

    @Column(name = "nf_num")
    private Integer nfNum;

    @Column(name = "nf_serie")
    private String nfSerie;

    @Column(name = "nf_date")
    private Date nfDate;

    @Column(name = "nf_key")
    private String nfKey;

}
