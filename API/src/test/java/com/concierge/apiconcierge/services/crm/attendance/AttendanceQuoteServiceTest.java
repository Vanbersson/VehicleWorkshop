package com.concierge.apiconcierge.services.crm.attendance;
import com.concierge.apiconcierge.dtos.crm.attendance.*;
import com.concierge.apiconcierge.models.crm.attendance.*;
import com.concierge.apiconcierge.exceptions.BusinessException;
import com.concierge.apiconcierge.repositories.crm.attendance.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.math.BigDecimal;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttendanceQuoteServiceTest {
 @Mock CustomerAttendanceService attendanceService;
 @Mock ICustomerAttendanceRepository attendanceRepository;
 @Mock IAttendanceQuoteRepository quoteRepository;
 @InjectMocks AttendanceQuoteService service;
 private QuoteSaveDto.Item item(String quantity, String price, QuoteDiscountType type, String discount) { return new QuoteSaveDto.Item("Produto", new BigDecimal(quantity), new BigDecimal(price), type, new BigDecimal(discount)); }
 private CustomerAttendance attendance() { CustomerAttendance a = new CustomerAttendance(); a.setId(1); a.setCompanyId(2); a.setResaleId(3); a.setVersion(0L); a.setStatus(AttendanceStatus.VISIT_COMPLETED); return a; }
 private void prepare(CustomerAttendance a) { when(attendanceService.authorizedAttendance(1, "user")).thenReturn(a); when(attendanceRepository.findForQuote(2, 3, 1)).thenReturn(a); }

 @Test void percentageAndFixedDiscountsApplyToTheLineSubtotal() {
  var percent = service.calculate(item("2", "100", QuoteDiscountType.PERCENTAGE, "10"));
  assertEquals(new BigDecimal("180.00"), percent.getTotal());
  var fixed = service.calculate(item("2", "100", QuoteDiscountType.FIXED, "25"));
  assertEquals(new BigDecimal("175.00"), fixed.getTotal());
 }
 @Test void roundsFractionalQuantitiesAndDiscountsToCents() {
  var line = service.calculate(item("0.333", "10", QuoteDiscountType.PERCENTAGE, "10"));
  assertEquals(new BigDecimal("3.33"), line.getSubtotal()); assertEquals(new BigDecimal("0.33"), line.getDiscountAmount()); assertEquals(new BigDecimal("3.00"), line.getTotal());
  assertEquals(new BigDecimal("0.01"), service.calculate(item("1", "0.05", QuoteDiscountType.PERCENTAGE, "10")).getDiscountAmount());
 }
 @Test void rejectsInvalidQuantityPriceAndDiscounts() {
  assertThrows(BusinessException.class, () -> service.calculate(item("0", "100", QuoteDiscountType.PERCENTAGE, "0")));
  assertThrows(BusinessException.class, () -> service.calculate(item("1", "-1", QuoteDiscountType.PERCENTAGE, "0")));
  assertThrows(BusinessException.class, () -> service.calculate(item("1", "100", QuoteDiscountType.PERCENTAGE, "101")));
  assertThrows(BusinessException.class, () -> service.calculate(item("1", "100", QuoteDiscountType.FIXED, "101")));
 }
 @Test void savesTotalsAndMovesAnInitialAttendanceToQuotation() {
  var a = attendance(); prepare(a);
  when(quoteRepository.findByCompanyIdAndResaleIdAndAttendanceId(2, 3, 1)).thenReturn(Optional.empty());
  when(quoteRepository.saveAndFlush(any())).thenAnswer(call -> { AttendanceQuote q = call.getArgument(0); q.setId(5); q.setVersion(0L); return q; });
  var response = service.save(new QuoteSaveDto(1, 0L, null, " Nota ", List.of(item("2", "100", QuoteDiscountType.PERCENTAGE, "10"))), "user");
  assertEquals(new BigDecimal("200.00"), response.quote().subtotal()); assertEquals(new BigDecimal("20.00"), response.quote().discountTotal()); assertEquals(new BigDecimal("180.00"), response.quote().total()); assertEquals(new BigDecimal("180.00"), response.attendance().quoteTotal()); assertEquals(AttendanceStatus.COMMERCIAL_PROPOSAL, response.attendance().status());
  verify(attendanceRepository).saveAndFlush(a);
 }
 @Test void editingAQuoteDoesNotRegressALaterAttendanceStage() {
  var a = attendance(); a.setStatus(AttendanceStatus.DOCUMENTS_PENDING); prepare(a);
  var q = new AttendanceQuote(); q.setId(5); q.setVersion(2L);
  when(quoteRepository.findByCompanyIdAndResaleIdAndAttendanceId(2, 3, 1)).thenReturn(Optional.of(q));
  when(quoteRepository.saveAndFlush(q)).thenReturn(q);
  var response = service.save(new QuoteSaveDto(1, 0L, 2L, "", List.of(item("1", "10", QuoteDiscountType.FIXED, "0"))), "user");
  assertEquals(AttendanceStatus.DOCUMENTS_PENDING, response.attendance().status()); verify(attendanceRepository, never()).saveAndFlush(any());
 }
 @Test void rejectsConcurrentCreationsOrStaleQuoteVersions() {
  var a = attendance(); prepare(a);
  var q = new AttendanceQuote(); q.setVersion(1L);
  when(quoteRepository.findByCompanyIdAndResaleIdAndAttendanceId(2, 3, 1)).thenReturn(Optional.of(q));
  assertThrows(BusinessException.class, () -> service.save(new QuoteSaveDto(1, 0L, null, "", List.of(item("1", "1", QuoteDiscountType.FIXED, "0"))), "user"));
  verify(quoteRepository, never()).saveAndFlush(any());
 }
 @Test void requiresAccessToTheAttendanceBeforeReadingAQuote() {
  when(attendanceService.authorizedAttendance(1, "user")).thenThrow(new BusinessException("Sem permissão"));
  assertThrows(BusinessException.class, () -> service.get(1, "user")); verifyNoInteractions(quoteRepository);
 }
 @Test void rejectsAnEmptyQuote() {
  var a = attendance(); prepare(a);
  when(quoteRepository.findByCompanyIdAndResaleIdAndAttendanceId(2, 3, 1)).thenReturn(Optional.empty());
  assertThrows(BusinessException.class, () -> service.save(new QuoteSaveDto(1, 0L, null, "", List.of()), "user")); verify(quoteRepository, never()).saveAndFlush(any());
 }

 @Test void cancelledAttendanceCannotHaveItsQuoteChanged() {
  var a = attendance(); a.setStatus(AttendanceStatus.CANCELLED); prepare(a);
  assertThrows(BusinessException.class, () -> service.save(new QuoteSaveDto(1, 0L, null, "", List.of(item("1", "1", QuoteDiscountType.FIXED, "0"))), "user"));
  verifyNoInteractions(quoteRepository);
 }
}
