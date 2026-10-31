package com.concierge.apiconcierge.dtos.crm.attendance;
import com.concierge.apiconcierge.models.crm.attendance.*;
import java.math.BigDecimal;
import java.util.Date;
import java.util.List;

public record QuoteResponseDto(AttendanceResponseDto attendance, Quote quote) {
    public record Quote(Integer id, Long version, String notes, Date dateCreated, Date dateUpdated,
            BigDecimal subtotal, BigDecimal discountTotal, BigDecimal total, List<Item> items) {}
    public record Item(String productName, BigDecimal quantity, BigDecimal unitPrice, QuoteDiscountType discountType,
            BigDecimal discountValue, BigDecimal subtotal, BigDecimal discountAmount, BigDecimal total) {}
    public static QuoteResponseDto from(CustomerAttendance a, AttendanceQuote q) {
        return new QuoteResponseDto(AttendanceResponseDto.from(a, q == null ? null : q.getTotal()), q == null ? null : new Quote(q.getId(), q.getVersion(), q.getNotes(), q.getDateCreated(), q.getDateUpdated(), q.getSubtotal(), q.getDiscountTotal(), q.getTotal(), q.getItems().stream().map(i -> new Item(i.getProductName(), i.getQuantity(), i.getUnitPrice(), i.getDiscountType(), i.getDiscountValue(), i.getSubtotal(), i.getDiscountAmount(), i.getTotal())).toList()));
    }
}
