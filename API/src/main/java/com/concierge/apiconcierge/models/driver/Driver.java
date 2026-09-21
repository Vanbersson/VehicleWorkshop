package com.concierge.apiconcierge.models.driver;


import com.concierge.apiconcierge.models.enums.MaleFemale;
import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
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
@Entity(name = "tb_driver")
@Table(name = "tb_driver")
public class Driver {

    @JoinColumn(table = "tb_company", referencedColumnName = "id")
    @Column(name = "company_id")
    private Integer companyId;

    @JoinColumn(table = "tb_resale", referencedColumnName = "id")
    @Column(name = "resale_id")
    private Integer resaleId;

    @Column(name="date_register")
    private Date dateRegister;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private StatusEnableDisable status;

    private String name;

    private String cpf;

    private String rg;

    @Column(name = "date_birth")
    private Date dateBirth;

    @Column(name = "male_female")
    private MaleFemale maleFemale;

    @Column(name = "cnh_register")
    private String cnhRegister;

    @Column(name = "cnh_category")
    private String cnhCategory;

    @Column(name = "cnh_validation")
    private Date cnhValidation;

    private String email;

    @Column(name = "ddd_cellphone")
    private String dddCellphone;

    private String cellphone;

    @Column(name = "ddd_phone")
    private String dddPhone;

    private String phone;

    @Column(name = "zip_code")
    private String zipCode;

    private String state;

    private String city;

    private String neighborhood;

    private String address;

    @Column(name = "address_number")
    private String addressNumber;

    @Column(name = "address_complement")
    private String addressComplement;

    @Column(name = "photo_driver_url")
    private String photoDriverUrl;

    @Column(name = " photo_doc1_url")
    private String photoDoc1Url;

    @Column(name = " photo_doc2_url")
    private String photoDoc2Url;
}
