package com.concierge.apiconcierge.models.budget;

import com.concierge.apiconcierge.models.budget.enums.StatusBudgetEnum;
import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@SecondaryTable(name = "tb_company", pkJoinColumns = @PrimaryKeyJoinColumn(name = "id"))
@SecondaryTable(name = "tb_resale", pkJoinColumns = @PrimaryKeyJoinColumn(name = "id"))
@SecondaryTable(name = "tb_vehicle_entry", pkJoinColumns = @PrimaryKeyJoinColumn(name = "id"))
@SecondaryTable(name = "tb_user", pkJoinColumns = @PrimaryKeyJoinColumn(name = "id"))
@SecondaryTable(name = "tb_client_company", pkJoinColumns = @PrimaryKeyJoinColumn(name = "id"))
@Entity
@Table(name = "tb_budget")
public class Budget {

    @JoinColumn(table = "tb_company", referencedColumnName = "id")
    @Column(name = "company_id")
    private Integer companyId;

    @JoinColumn(table = "tb_resale", referencedColumnName = "id")
    @Column(name = "resale_id")
    private Integer resaleId;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @JoinColumn(table = "tb_vehicle_entry", referencedColumnName = "id")
    @Column(name = "vehicle_entry_id")
    private Integer vehicleEntryId;

    private StatusBudgetEnum status;

    @Column(name = "date_generation")
    private Date dateGeneration;

    @Column(name = "date_validation")
    private Date dateValidation;

    @Column(name = "date_authorization")
    private Date dateAuthorization;

    @Column(name = "name_responsible")
    private String nameResponsible;

    @Column(name = "type_payment")
    private String typePayment;

    @JoinColumn(table = "tb_user", referencedColumnName = "id")
    @Column(name = "id_user_attendant")
    private Integer idUserAttendant;

    @JoinColumn(table = "tb_client_company", referencedColumnName = "id")
    @Column(name = "client_company_id")
    private Integer clientCompanyId;

    private String information;

    @Column(name = "client_send_date")
    private Date clientSendDate;

    @Column(name = "client_approved_date")
    private Date clientApprovedDate;
}
