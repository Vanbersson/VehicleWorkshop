package com.concierge.apiconcierge.models.crm.visit;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "tb_salesperson_visit")
public class SalespersonVisit {

    @Column(name = "company_id")
    private Integer companyId;

    @Column(name = "resale_id")
    private Integer resaleId;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private StatusVisitEnum status;

    @Column(name = "date_register")
    private Date dateRegister;

    @Column(name = "user_id_register")
    private Integer userIdRegister;

    @Column(name = "user_name_register")
    private String userNameRegister;

    @Column(name = "date_visit")
    private Date dateVisit;

    @Column(name = "salesperson_id")
    private Integer salespersonId;

    @Column(name = "salesperson_name")
    private String salespersonName;

    @Column(name = "salesperson_info")
    private String salespersonInfo;

    @Column(name = "contact_type")
    private ContactTypeEnum contactType;

    private String contact;

    @Column(name = "client_id")
    private Integer clientId;

    @Column(name = "client_name")
    private String clientName;

    @Column(name = "client_CNPJ")
    private String clientCNPJ;

    @Column(name = "client_CPF")
    private String clientCPF;

    private String latitude;

    private String longitude;

    @Column(name = "reason_visit")
    private String reasonVisit;

    @Column(name = "reason_visit_info")
    private String reasonVisitInfo;

    private String products;

    @Column(name = "products_info")
    private String productsInfo;



    @Column(name = "agenda_info")
    private String agendaInfo;

    @Column(name = "agenda_date")
    private Date agendaDate;
}
