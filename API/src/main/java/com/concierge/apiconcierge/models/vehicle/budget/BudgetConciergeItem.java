package com.concierge.apiconcierge.models.vehicle.budget;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "tb_concierge_budget_item")
public class BudgetConciergeItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(name = "company_id", nullable = false)
    private Integer companyId;
    @Column(name = "resale_id", nullable = false)
    private Integer resaleId;
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "budget_id", nullable = false)
    private BudgetConcierge budget;
    @Column(nullable = false, columnDefinition = "tinyint")
    private Integer type;
    @Column(nullable = false, length = 100)
    private String description;
    @Column(nullable = false, precision = 11, scale = 2)
    private BigDecimal quantity;
    @Column(name = "hour_service", precision = 11, scale = 2)
    private BigDecimal hourService;
    @Column(precision = 11, scale = 3)
    private BigDecimal price;
    @Column(precision = 11, scale = 3)
    private BigDecimal discount;

    public Integer getBudgetId() {
        return budget == null ? null : budget.getId();
    }
}
