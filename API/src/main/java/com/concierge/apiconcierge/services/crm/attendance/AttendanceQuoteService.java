package com.concierge.apiconcierge.services.crm.attendance;
import com.concierge.apiconcierge.dtos.crm.attendance.*;
import com.concierge.apiconcierge.models.crm.attendance.*;
import com.concierge.apiconcierge.exceptions.BusinessException;
import com.concierge.apiconcierge.repositories.crm.attendance.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.*;
import java.util.*;

@Service
public class AttendanceQuoteService {
    @Autowired private CustomerAttendanceService attendanceService;
    @Autowired private ICustomerAttendanceRepository attendanceRepository;
    @Autowired private IAttendanceQuoteRepository quoteRepository;

    @Transactional(readOnly = true)
    public QuoteResponseDto get(Integer attendanceId, String email) {
        CustomerAttendance a = attendanceService.authorizedAttendance(attendanceId, email);
        return QuoteResponseDto.from(a, quoteRepository.findByCompanyIdAndResaleIdAndAttendanceId(a.getCompanyId(), a.getResaleId(), a.getId()).orElse(null));
    }

    @Transactional
    public QuoteResponseDto save(QuoteSaveDto data, String email) {
        CustomerAttendance scope = attendanceService.authorizedAttendance(data.attendanceId(), email);
        CustomerAttendance a = attendanceRepository.findForQuote(scope.getCompanyId(), scope.getResaleId(), scope.getId());
        if (a == null || !Objects.equals(a.getVersion(), data.attendanceVersion())) throw new BusinessException("O atendimento foi alterado. Feche e abra o orçamento novamente.");
        if (a.getStatus() == AttendanceStatus.COMPLETED) throw new BusinessException("O atendimento concluído está disponível apenas para consulta.");
        if (a.getStatus() == AttendanceStatus.CANCELLED) throw new BusinessException("O atendimento está cancelado. O orçamento está disponível apenas para consulta.");
        AttendanceQuote quote = quoteRepository.findByCompanyIdAndResaleIdAndAttendanceId(a.getCompanyId(), a.getResaleId(), a.getId()).orElse(null);
        if (quote != null && !Objects.equals(quote.getVersion(), data.version()) || quote == null && data.version() != null) throw new BusinessException("O orçamento foi alterado. Feche e abra o diálogo novamente.");
        if (data.items() == null || data.items().isEmpty() || data.items().size() > 100) throw new BusinessException("Informe de 1 a 100 produtos.");
        if (quote == null) {
            quote = new AttendanceQuote(); quote.setAttendanceId(a.getId()); quote.setCompanyId(a.getCompanyId()); quote.setResaleId(a.getResaleId()); quote.setDateCreated(new Date());
        }
        List<AttendanceQuoteItem> items = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO, discounts = BigDecimal.ZERO;
        for (QuoteSaveDto.Item input : data.items()) {
            AttendanceQuoteItem item = calculate(input); item.setQuote(quote); item.setPosition(items.size() + 1); items.add(item);
            subtotal = subtotal.add(item.getSubtotal()); discounts = discounts.add(item.getDiscountAmount());
        }
        if (subtotal.setScale(2).precision() > 19) throw new BusinessException("O valor total ultrapassa o limite permitido.");
        quote.getItems().clear(); quote.getItems().addAll(items);
        quote.setNotes(data.notes() == null ? "" : data.notes().trim()); quote.setDateUpdated(new Date());
        quote.setSubtotal(subtotal.setScale(2)); quote.setDiscountTotal(discounts.setScale(2)); quote.setTotal(subtotal.subtract(discounts).setScale(2));
        AttendanceQuote saved = quoteRepository.saveAndFlush(quote);
        if (a.getStatus() == AttendanceStatus.VISIT_COMPLETED) { a.setStatus(AttendanceStatus.COMMERCIAL_PROPOSAL); attendanceRepository.saveAndFlush(a); }
        return QuoteResponseDto.from(a, saved);
    }

    AttendanceQuoteItem calculate(QuoteSaveDto.Item input) {
        if (input == null || input.productName() == null || input.productName().trim().isEmpty() || input.productName().trim().length() > 255 || input.quantity() == null || input.quantity().signum() <= 0 || input.unitPrice() == null || input.unitPrice().signum() < 0 || input.discountValue() == null || input.discountValue().signum() < 0 || input.discountType() == null) throw new BusinessException("Revise produto, quantidade, preço e desconto.");
        BigDecimal gross = input.quantity().multiply(input.unitPrice()).setScale(2, RoundingMode.HALF_UP);
        BigDecimal discount = input.discountType() == QuoteDiscountType.PERCENTAGE
                ? gross.multiply(input.discountValue()).divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP)
                : input.discountValue().setScale(2, RoundingMode.HALF_UP);
        if (input.discountType() == QuoteDiscountType.PERCENTAGE && input.discountValue().compareTo(new BigDecimal("100")) > 0 || discount.compareTo(gross) > 0) throw new BusinessException("O desconto não pode ultrapassar o valor do item ou 100%.");
        if (gross.precision() > 19) throw new BusinessException("O valor do item ultrapassa o limite permitido.");
        AttendanceQuoteItem item = new AttendanceQuoteItem(); item.setProductName(input.productName().trim()); item.setQuantity(input.quantity()); item.setUnitPrice(input.unitPrice()); item.setDiscountType(input.discountType()); item.setDiscountValue(input.discountValue()); item.setSubtotal(gross); item.setDiscountAmount(discount); item.setTotal(gross.subtract(discount)); return item;
    }
}
