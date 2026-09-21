package com.concierge.apiconcierge.models.workshop.toolcontrol;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.workshop.toolcontrol.enums.TypeRequest;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "tb_tool_control_material")
public class ToolControlMaterial {

    @Column(name = "company_id")
    private Integer companyId;

    @Column(name = "resale_id")
    private Integer resaleId;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private StatusEnableDisable status;

    private TypeRequest type;

    @Column(name = "number_ca")
    private Integer numberCA;

    private String description;

    @Column(name = "category_id")
    private Integer categoryId;

    @Column(name = "quantity_accounting_loan")
    private BigDecimal quantityAccountingLoan;

    @Column(name = "quantity_available_loan")
    private BigDecimal quantityAvailableLoan;

    @Column(name = "quantity_accounting_kit")
    private BigDecimal quantityAccountingKit;

    @Column(name = "quantity_available_kit")
    private BigDecimal quantityAvailableKit;

    @Column(name = "validity_day")
    private Integer validityDay;

    @Column(name = "photo_url")
    private String photoUrl;
}
