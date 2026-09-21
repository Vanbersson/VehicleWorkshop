package com.concierge.apiconcierge.models.workshop.toolcontrol;


import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.Date;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "tb_tool_control_mat_mec")
public class ToolControlMatMec {

    @Column(name = "company_id")
    private Integer companyId;

    @Column(name = "resale_id")
    private Integer resaleId;

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "request_id")
    private Integer requestId;

    @Column(name = "delivery_user_id")
    private Integer deliveryUserId;

    @Column(name = "delivery_user_name")
    private String deliveryUserName;

    @Column(name = "delivery_date")
    private Date deliveryDate;

    @Column(name = "delivery_quantity")
    private BigDecimal deliveryQuantity;

    @Column(name = "delivery_information")
    private String deliveryInformation;

    @Column(name = "return_user_id")
    private Integer returnUserId;

    @Column(name = "return_user_name")
    private String returnUserName;

    @Column(name = "return_date")
    private Date returnDate;

    @Column(name = "return_quantity")
    private BigDecimal returnQuantity;

    @Column(name = "return_information")
    private String returnInformation;

    @Column(name = "material_id")
    private Integer materialId;

    @Column(name = "material_description")
    private String materialDescription;

    @Column(name = "material_number_ca")
    private Integer materialNumberCA;
}
