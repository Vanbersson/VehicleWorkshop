package com.concierge.apiconcierge.models.workshop.mechanic;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@SecondaryTable(name = "tb_company", pkJoinColumns = @PrimaryKeyJoinColumn(name = "id"))
@SecondaryTable(name = "tb_resale", pkJoinColumns = @PrimaryKeyJoinColumn(name = "id"))
@SecondaryTable(name = "tb_mechanic_department", pkJoinColumns = @PrimaryKeyJoinColumn(name = "id"))
@Entity
@Table(name = "tb_mechanic")
public class Mechanic {

    @JoinColumn(table = "tb_company", referencedColumnName = "id")
    @Column(name = "company_id")
    private Integer companyId;

    @JoinColumn(table = "tb_resale", referencedColumnName = "id")
    @Column(name = "resale_id")
    private Integer resaleId;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private StatusEnableDisable status;

    private String name;

    @Column(name = "code_password")
    private Integer codePassword;

    @JoinColumn(table = "tb_mechanic_department", referencedColumnName = "id")
    @Column(name = "department_id")
    private Integer departmentId;

    @Column(name = "photo_url")
    private String photoUrl;
}
