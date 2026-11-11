package com.concierge.apiconcierge.models.vehicle.budget;

import com.concierge.apiconcierge.models.budget.enums.StatusBudgetEnum;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "tb_concierge_budget")
public class BudgetConcierge {
    @Column(name="cancellation_reason",length=1000)
    private String cancellationReason;
    @OneToMany(mappedBy="budget",cascade=CascadeType.ALL,orphanRemoval=true)
    private java.util.List<BudgetConciergeItem> items = new java.util.ArrayList<>();
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Enumerated(EnumType.ORDINAL)
    private StatusBudgetEnum status;
    @Column(name = "company_id")
    private Integer companyId;
    @Column(name = "resale_id")
    private Integer resaleId;
    @Column(name = "vehicle_id")
    private Integer vehicleId;
    @Transient
    private String vehiclePlate;
    @Transient
    private Boolean canEdit;
    @Column(name = "date_validation")
    private LocalDateTime dateValidation;
    @Column(name = "date_authorization")
    private LocalDateTime dateAuthorization;
    @Column(name = "generation_user_id")
    private Integer generationUserId;
    @Column(name = "generation_user_name")
    private String generationUserName;
    @Column(name = "generation_date")
    private LocalDateTime generationDate;
    @Column(name = "payment_type_id")
    private Integer paymentTypeId;
    @Column(name = "payment_type_desc")
    private String paymentTypeDesc;
    @Column(name = "salesperson_user_id", nullable = false)
    private Integer salespersonUserId;
    @Column(name = "salesperson_user_name", nullable = false)
    private String salespersonUserName;
    @Column(name = "client_company_id")
    private Integer clientCompanyId;
    @Column(name = "client_company_name")
    private String clientCompanyName;
    @Column(name = "information")
    private String information;
}
