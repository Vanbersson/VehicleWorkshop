package com.concierge.apiconcierge.models.salesperson;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "tb_salesperson_group")
public class SalespersonGroup {
    @Column(name = "company_id")
    private Integer companyId;

    @Column(name = "resale_id")
    private Integer resaleId;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private StatusEnableDisable status;

    private String description;

    private String ufs;

    private String brands;

    private String regions;
}
