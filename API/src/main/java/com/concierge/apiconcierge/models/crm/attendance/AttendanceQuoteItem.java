package com.concierge.apiconcierge.models.crm.attendance;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Entity
@Table(name = "tb_crm_attendance_quote_item")
public class AttendanceQuoteItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quote_id", nullable = false)
    private AttendanceQuote quote;
    @Column(name = "item_position", nullable = false)
    private Integer position;
    @Column(name = "product_name", nullable = false)
    private String productName;
    @Column(nullable = false, precision = 12, scale = 3)
    private BigDecimal quantity;
    @Column(name = "unit_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal unitPrice;
    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", nullable = false, length = 16)
    private QuoteDiscountType discountType;
    @Column(name = "discount_value", nullable = false, precision = 15, scale = 2)
    private BigDecimal discountValue;
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal subtotal;
    @Column(name = "discount_amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal discountAmount;
    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal total;
}
