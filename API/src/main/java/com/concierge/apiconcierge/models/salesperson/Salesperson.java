package com.concierge.apiconcierge.models.salesperson;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.enums.YesNot;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "tb_salesperson")
public class Salesperson {
    @Column(name = "company_id")
    private Integer companyId;

    @Column(name = "resale_id")
    private Integer resaleId;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private StatusEnableDisable status;

    private String name;

    private String cpf;

    @Column(name = "ddd_cellphone")
    private String dddCellphone;

    private String cellphone;

    @Column(name = "limit_discount")
    private BigDecimal limitDiscount;

    @Column(name = "type_sales")
    private TypeSalesEnum typeSales;

    @Column(name = "type_sales_part")
    private YesNot typeSalesPart;

    @Column(name = "type_sales_service")
    private YesNot typeSalesService;

    @Column(name = "type_sales_vehicle")
    private YesNot typeSalesVehicle;

    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "group_ids")
    private String groupIds;

    @Column(name = "photo_url")
    private String photoUrl;
}
