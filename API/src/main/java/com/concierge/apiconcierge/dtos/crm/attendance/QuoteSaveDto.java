package com.concierge.apiconcierge.dtos.crm.attendance;
import com.concierge.apiconcierge.models.crm.attendance.QuoteDiscountType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public record QuoteSaveDto(@NotNull Integer attendanceId, @NotNull Long attendanceVersion,
        Long version, @Size(max = 2000) String notes, @NotEmpty @Size(max = 100) List<@NotNull @Valid Item> items) {
    public record Item(@NotBlank @Size(max = 255) String productName,
        @NotNull @DecimalMin(value = "0", inclusive = false) @Digits(integer = 9, fraction = 3) BigDecimal quantity,
        @NotNull @DecimalMin("0") @Digits(integer = 12, fraction = 2) BigDecimal unitPrice,
        @NotNull QuoteDiscountType discountType,
        @NotNull @DecimalMin("0") @Digits(integer = 12, fraction = 2) BigDecimal discountValue) {}
}
