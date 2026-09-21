package com.concierge.apiconcierge.models.purchase;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "tb_purchase_order_item_consumption")
public class PurchaseOrderItemConsumption {

    @Column(name = "company_id", nullable = false)
    private Integer companyId;

    @Column(name = "resale_id", nullable = false)
    private Integer resaleId;

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "binary(16)")
    private UUID id;

    @Column(name = "purchase_id", nullable = false)
    private Integer purchaseId;

    @Column(name = "item_order", nullable = false)
    private Integer itemOrder;

    @Column(name = "item_description", nullable = false, length = 100)
    private String description;

    @Column(name = "quantity", nullable = false, precision = 11, scale = 3)
    private BigDecimal quantity;

    @Column(name = "discount", nullable = false, precision = 11, scale = 3)
    private BigDecimal discount;

    @Column(name = "price", nullable = false, precision = 11, scale = 3)
    private BigDecimal price;
}