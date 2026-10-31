package com.concierge.apiconcierge.services.crm.attendance;

import com.concierge.apiconcierge.dtos.crm.attendance.AttendanceUpdateDto;
import com.concierge.apiconcierge.exceptions.BusinessException;
import com.concierge.apiconcierge.exceptions.ResourcesNotFoundException;
import com.concierge.apiconcierge.models.crm.attendance.*;
import com.concierge.apiconcierge.models.crm.visit.*;
import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.permission.PermissionUser;
import com.concierge.apiconcierge.models.salesperson.Salesperson;
import com.concierge.apiconcierge.models.user.User;
import com.concierge.apiconcierge.repositories.crm.attendance.ICustomerAttendanceRepository;
import com.concierge.apiconcierge.repositories.permission.IPermissionUserRepository;
import com.concierge.apiconcierge.repositories.salesperson.ISalespersonRepository;
import com.concierge.apiconcierge.repositories.user.IUserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CustomerAttendanceServiceTest {
    @Mock ICustomerAttendanceRepository repository;
    @Mock com.concierge.apiconcierge.repositories.crm.visit.ISalespersonVisitRepository visitRepository;
    @Mock com.concierge.apiconcierge.repositories.crm.attendance.IAttendanceQuoteRepository quoteRepository;
    @Mock com.concierge.apiconcierge.repositories.clientcompany.IClientCompanyRepository clientRepository;
    @Mock IUserRepository userRepository;
    @Mock ISalespersonRepository salespersonRepository;
    @Mock IPermissionUserRepository permissionRepository;
    @InjectMocks CustomerAttendanceService service;

    @BeforeEach void prepareUser() {
        User user = new User(); user.setName("Operador"); user.setId(9); user.setCompanyId(1); user.setResaleId(2); user.setStatus(StatusEnableDisable.Habilitado);
        Salesperson salesperson = new Salesperson(); salesperson.setId(700); salesperson.setStatus(StatusEnableDisable.Habilitado);
        lenient().when(userRepository.loginEmail("user")).thenReturn(user);
        lenient().when(salespersonRepository.findByCompanyIdAndResaleIdAndUserId(1, 2, 9)).thenReturn(salesperson);
    }

    private CustomerAttendance attendance(int id, int salespersonId) {
        CustomerAttendance a = new CustomerAttendance(); a.setId(id); a.setVisitId(42); a.setSalespersonId(salespersonId); a.setVersion(0L); return a;
    }

    @Test void changesClientUsingScopedCanonicalDataWithoutUpdatingVisit() {
        CustomerAttendance a = attendance(1, 700);
        when(repository.findByCompanyIdAndResaleIdAndId(1, 2, 1)).thenReturn(Optional.of(a));
        var client = new com.concierge.apiconcierge.models.clientcompany.ClientCompany();
        client.setId(88); client.setName("Novo cliente"); client.setStatus(StatusEnableDisable.Habilitado);
        when(clientRepository.filterId(1, 2, 88)).thenReturn(client);
        when(repository.saveAndFlush(a)).thenReturn(a);
        var result = service.update(new AttendanceUpdateDto(1, AttendanceStatus.VISIT_COMPLETED, "", 0L, "", "", 88), "user");
        assertEquals(88, result.clientId()); assertEquals("Novo cliente", result.clientName());
        verifyNoInteractions(visitRepository);
    }

    @Test void rejectsClientOutsideScopeOrDisabled() {
        CustomerAttendance a = attendance(1, 700);
        when(repository.findByCompanyIdAndResaleIdAndId(1, 2, 1)).thenReturn(Optional.of(a));
        var request = new AttendanceUpdateDto(1, AttendanceStatus.VISIT_COMPLETED, "", 0L, "", "", 88);
        assertThrows(ResourcesNotFoundException.class, () -> service.update(request, "user"));
        var client = new com.concierge.apiconcierge.models.clientcompany.ClientCompany();
        client.setStatus(StatusEnableDisable.Desabilitado);
        when(clientRepository.filterId(1, 2, 88)).thenReturn(client);
        assertThrows(BusinessException.class, () -> service.update(request, "user"));
        verify(repository, never()).saveAndFlush(any());
    }

    @Test void createsOnceWithVisitCompletedStageForACompletedVisit() {
        SalespersonVisit visit = new SalespersonVisit(); visit.setId(42); visit.setStatus(StatusVisitEnum.concluído); visit.setCompanyId(1); visit.setResaleId(2); visit.setClientName("Cliente"); visit.setSalespersonId(700); visit.setSalespersonName("Vendedor");
        when(repository.findByVisitId(42)).thenReturn(Optional.empty());
        when(repository.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));
        CustomerAttendance created = service.createForVisit(visit);
        assertEquals(AttendanceStatus.VISIT_COMPLETED, created.getStatus());
        assertEquals(42, created.getVisitId()); assertEquals(1, created.getCompanyId()); assertEquals(2, created.getResaleId());
        when(repository.findByVisitId(42)).thenReturn(Optional.of(created));
        assertSame(created, service.createForVisit(visit));
        verify(repository, times(1)).saveAndFlush(any());
    }

    @Test void doesNotGenerateAttendanceForADraft() {
        SalespersonVisit visit = new SalespersonVisit(); visit.setId(42); visit.setStatus(StatusVisitEnum.iniciou);
        assertThrows(BusinessException.class, () -> service.createForVisit(visit));
        verifyNoInteractions(repository);
    }

    @Test void listsOnlyTheCurrentSalespersonWithinCompanyAndResale() {
        when(repository.search(eq(1), eq(2), nullable(Integer.class), eq(AttendanceStatus.CANCELLED), eq(false), nullable(Integer.class), eq(""), eq(""))).thenReturn(List.of(attendance(1, 700), attendance(2, 701)));
        assertEquals(List.of(1), service.list("user").stream().map(a -> a.id()).toList());
    }

    @Test void permissionAllowsOtherSalespeopleWithinTheSameCompanyAndResale() {
        when(permissionRepository.findPermissionId(1, 2, 9, 400)).thenReturn(new PermissionUser());
        when(repository.search(eq(1), eq(2), nullable(Integer.class), eq(AttendanceStatus.CANCELLED), eq(false), nullable(Integer.class), eq(""), eq(""))).thenReturn(List.of(attendance(1, 700), attendance(2, 701)));
        assertEquals(2, service.list("user").size());
    }

    @Test void replacesASingleStageAndUpdatesVersion() {
        CustomerAttendance a = attendance(1, 700);
        when(repository.findByCompanyIdAndResaleIdAndId(1, 2, 1)).thenReturn(Optional.of(a));
        when(repository.saveAndFlush(a)).thenAnswer(invocation -> { a.setVersion(1L); return a; });
        var result = service.update(new AttendanceUpdateDto(1, AttendanceStatus.DOCUMENTS_PENDING, " Documento pendente ", 0L), "user");
        assertEquals(AttendanceStatus.DOCUMENTS_PENDING, result.status());
        assertEquals("Documento pendente", result.notes()); assertEquals(1L, result.version());
    }

    @Test void rejectsUpdatesOutsideTheUsersScope() {
        when(repository.findByCompanyIdAndResaleIdAndId(1, 2, 1)).thenReturn(Optional.of(attendance(1, 701)));
        assertThrows(BusinessException.class, () -> service.update(new AttendanceUpdateDto(1, AttendanceStatus.COMPLETED, "", 0L), "user"));
        verify(repository, never()).saveAndFlush(any());
    }

    @Test void rejectsStaleVersionsAndMissingScopedRecords() {
        CustomerAttendance a = attendance(1, 700); a.setVersion(2L);
        when(repository.findByCompanyIdAndResaleIdAndId(1, 2, 1)).thenReturn(Optional.of(a));
        assertThrows(BusinessException.class, () -> service.update(new AttendanceUpdateDto(1, AttendanceStatus.PAYMENT_PENDING, "", 0L), "user"));
        when(repository.findByCompanyIdAndResaleIdAndId(1, 2, 1)).thenReturn(Optional.empty());
        assertThrows(ResourcesNotFoundException.class, () -> service.update(new AttendanceUpdateDto(1, AttendanceStatus.COMPLETED, "", 0L), "user"));
        verify(repository, never()).saveAndFlush(any());
    }

    @Test void includesNetTotalsWithoutTreatingAZeroQuoteAsMissing() {
        when(repository.search(eq(1), eq(2), nullable(Integer.class), eq(AttendanceStatus.CANCELLED), eq(false), nullable(Integer.class), eq(""), eq(""))).thenReturn(List.of(attendance(1, 700), attendance(2, 700)));
        when(quoteRepository.findTotals(1, 2, List.of(1, 2))).thenReturn(List.of(new com.concierge.apiconcierge.dtos.crm.attendance.QuoteTotalDto(1, java.math.BigDecimal.ZERO)));
        var result = service.list("user");
        assertEquals(java.math.BigDecimal.ZERO, result.get(0).quoteTotal());
        assertNull(result.get(1).quoteTotal());
    }

    @Test void preservesQuoteTotalWhenUpdatingTheAttendanceStage() {
        CustomerAttendance a = attendance(1, 700); a.setCompanyId(1); a.setResaleId(2);
        when(repository.findByCompanyIdAndResaleIdAndId(1, 2, 1)).thenReturn(Optional.of(a));
        when(repository.saveAndFlush(a)).thenReturn(a);
        com.concierge.apiconcierge.models.crm.attendance.AttendanceQuote q = new com.concierge.apiconcierge.models.crm.attendance.AttendanceQuote(); q.setTotal(new java.math.BigDecimal("180.00"));
        when(quoteRepository.findByCompanyIdAndResaleIdAndAttendanceId(1, 2, 1)).thenReturn(Optional.of(q));
        var result = service.update(new AttendanceUpdateDto(1, AttendanceStatus.PAYMENT_PENDING, "", 0L), "user");
        assertEquals(new java.math.BigDecimal("180.00"), result.quoteTotal());
    }

    @Test void cancellationRequiresANonblankReason() {
        assertThrows(BusinessException.class, () -> service.cancel(new com.concierge.apiconcierge.dtos.crm.attendance.AttendanceCancelDto(1, 0L, "   "), "user"));
        verify(repository, never()).saveAndFlush(any());
    }

    @Test void cancellationStoresReasonDateAndActorAndPreservesTheQuote() {
        CustomerAttendance a = attendance(1, 700); a.setCompanyId(1); a.setResaleId(2);
        when(repository.findByCompanyIdAndResaleIdAndId(1, 2, 1)).thenReturn(Optional.of(a));
        when(repository.findForQuote(1, 2, 1)).thenReturn(a);
        when(repository.saveAndFlush(a)).thenAnswer(call -> { a.setVersion(1L); return a; });
        AttendanceQuote q = new AttendanceQuote(); q.setTotal(new java.math.BigDecimal("180.00"));
        when(quoteRepository.findByCompanyIdAndResaleIdAndAttendanceId(1, 2, 1)).thenReturn(Optional.of(q));
        var result = service.cancel(new com.concierge.apiconcierge.dtos.crm.attendance.AttendanceCancelDto(1, 0L, " Cliente desistiu "), "user");
        assertEquals(AttendanceStatus.CANCELLED, result.status()); assertEquals("Cliente desistiu", result.cancellationReason()); assertNotNull(result.cancelledAt()); assertEquals("Operador", result.cancelledByName()); assertEquals(9, a.getCancelledById()); assertEquals(new java.math.BigDecimal("180.00"), result.quoteTotal());
    }

    @Test void cancellationCannotBypassTheSalespersonScope() {
        when(repository.findByCompanyIdAndResaleIdAndId(1, 2, 1)).thenReturn(Optional.of(attendance(1, 701)));
        assertThrows(BusinessException.class, () -> service.cancel(new com.concierge.apiconcierge.dtos.crm.attendance.AttendanceCancelDto(1, 0L, "Motivo"), "user"));
        verify(repository, never()).saveAndFlush(any());
    }

    @Test void cancellationRejectsStaleVersionsAndDoesNotOverwriteAPreviousCancellation() {
        CustomerAttendance a = attendance(1, 700); a.setCompanyId(1); a.setResaleId(2); a.setVersion(2L);
        when(repository.findByCompanyIdAndResaleIdAndId(1, 2, 1)).thenReturn(Optional.of(a));
        when(repository.findForQuote(1, 2, 1)).thenReturn(a);
        var request = new com.concierge.apiconcierge.dtos.crm.attendance.AttendanceCancelDto(1, 0L, "Novo motivo");
        assertThrows(BusinessException.class, () -> service.cancel(request, "user"));
        a.setStatus(AttendanceStatus.CANCELLED); a.setCancellationReason("Motivo original");
        assertThrows(BusinessException.class, () -> service.cancel(request, "user"));
        assertEquals("Motivo original", a.getCancellationReason()); verify(repository, never()).saveAndFlush(any());
    }

    @Test void stageUpdatesCannotBypassCancellationReasonOrReopenACancelledAttendance() {
        CustomerAttendance a = attendance(1, 700);
        when(repository.findByCompanyIdAndResaleIdAndId(1, 2, 1)).thenReturn(Optional.of(a));
        assertThrows(BusinessException.class, () -> service.update(new AttendanceUpdateDto(1, AttendanceStatus.CANCELLED, "", 0L), "user"));
        a.setStatus(AttendanceStatus.CANCELLED);
        assertThrows(BusinessException.class, () -> service.update(new AttendanceUpdateDto(1, AttendanceStatus.QUOTATION, "", 0L), "user"));
        verify(repository, never()).saveAndFlush(any());
    }

    @Test void cancelledQueryRequiresAnIdentifyingFilter() {
        assertThrows(BusinessException.class, () -> service.search(new com.concierge.apiconcierge.dtos.crm.attendance.AttendanceSearchDto(null, "  ", ""), true, "user"));
        verify(repository, never()).search(any(), any(), any(), any(), anyBoolean(), any(), any(), any());
    }

    @Test void dedicatedQueriesPassModeFiltersAndSalespersonScopeToTheDatabase() {
        var criteria = new com.concierge.apiconcierge.dtos.crm.attendance.AttendanceSearchDto(42, " Cliente ", " Vendedor ");
        service.search(criteria, true, "user");
        verify(repository).search(1, 2, 700, AttendanceStatus.CANCELLED, true, 42, "Cliente", "Vendedor");
        service.search(criteria, false, "user");
        verify(repository).search(1, 2, 700, AttendanceStatus.CANCELLED, false, 42, "Cliente", "Vendedor");
    }

    @Test void detailsResolveTheVisitInsideTheAttendanceTenantScope() {
        CustomerAttendance a = attendance(1, 700); a.setCompanyId(1); a.setResaleId(2);
        when(repository.findByCompanyIdAndResaleIdAndId(1, 2, 1)).thenReturn(Optional.of(a));
        SalespersonVisit visit = new SalespersonVisit(); visit.setId(42); visit.setClientName("Cliente original");
        when(visitRepository.findByCompanyIdAndResaleIdAndId(1, 2, 42)).thenReturn(visit);
        var result = service.detail(1, "user");
        assertSame(visit, result.visit()); assertEquals(1, result.attendance().id());
    }

    @Test void detailsRejectAVisitOutsideTheTenantOrSalespersonScope() {
        CustomerAttendance a = attendance(1, 700); a.setCompanyId(1); a.setResaleId(2);
        when(repository.findByCompanyIdAndResaleIdAndId(1, 2, 1)).thenReturn(Optional.of(a));
        assertThrows(ResourcesNotFoundException.class, () -> service.detail(1, "user"));
        a.setSalespersonId(701);
        assertThrows(BusinessException.class, () -> service.detail(1, "user"));
    }

    @Test void workflowNotesAndApprovalAndCompletionDatesArePersisted() {
        CustomerAttendance a = attendance(1, 700);
        when(repository.findByCompanyIdAndResaleIdAndId(1, 2, 1)).thenReturn(Optional.of(a));
        when(repository.saveAndFlush(a)).thenReturn(a);
        var approval = service.update(new AttendanceUpdateDto(1, AttendanceStatus.APPROVAL_PENDING, " Nota ", 0L, " Documentos ", " Proposta "), "user");
        assertEquals("Documentos", approval.documentsNotes()); assertEquals("Proposta", approval.proposalNotes()); assertNotNull(approval.approvalRequestedAt());
        var completed = service.update(new AttendanceUpdateDto(1, AttendanceStatus.COMPLETED, "", 0L), "user");
        assertNotNull(completed.completedAt()); assertEquals("Proposta", completed.proposalNotes());
    }
}
