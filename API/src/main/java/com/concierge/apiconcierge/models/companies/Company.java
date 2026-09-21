package com.concierge.apiconcierge.models.companies;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "tb_company")
public class Company implements Serializable {

    private static final long serialVersionUID = 2l;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private StatusEnableDisable status;

    private String name;

    private String cnpj;

    private String email;

    private String cellphone;

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


}
