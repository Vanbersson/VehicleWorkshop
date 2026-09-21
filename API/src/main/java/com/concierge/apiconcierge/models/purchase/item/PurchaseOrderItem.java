package com.concierge.apiconcierge.models.purchase.item;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "tb_purchase_order_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseOrderItem {

    @EmbeddedId
    private PurchaseOrderItemId id;

    @Column(name = "item_order")
    private Integer itemOrder;

    @Column(name = "item_code")
    private String itemCode;

    @Column(name = "item_description")
    private String itemDescription;

    private BigDecimal quantity;
    private BigDecimal discount;
    private BigDecimal price;
}
