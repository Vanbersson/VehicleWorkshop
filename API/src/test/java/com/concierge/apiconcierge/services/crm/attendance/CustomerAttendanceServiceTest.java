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
    @Mock com.concierge.apiconcierge.repositories.crm.attendance.IAttendanceLogRepository logRepository;
    @Mock com.concierge.apiconcierge.repositories.crm.attendance.IAttendanceDocumentRepository documentRepository;
    @Mock com.concierge.apiconcierge.repositories.crm.visit.ISalespersonVisitRepository visitRepository;
    @Mock com.concierge.apiconcierge.repositories.crm.attendance.IAttendanceQuoteRepository quoteRepository;
    @Mock com.concierge.apiconcierge.repositories.clientcompany.IClientCompanyRepository clientRepository;
    @Mock IUserRepository userRepository;
    @Mock ISalespersonRepository salespersonRepository;
    @Mock IPermissionUserRepository permissionRepository;
    @InjectMocks CustomerAttendanceService service;

    @Test void createsDirectAttendanceWithoutCreatingOrCompletingAVisit() {
        Salesperson salesperson = new Salesperson(); salesperson.setId(700); salesperson.setName("Seller"); salesperson.setStatus(StatusEnableDisable.Habilitado);
        when(salespersonRepository.findByCompanyIdAndResaleIdAndId(1, 2, 700)).thenReturn(salesperson);
        var client = new com.concierge.apiconcierge.models.clientcompany.ClientCompany();
        client.setId(88); client.setName("Client"); client.setStatus(StatusEnableDisable.Habilitado);
        when(clientRepository.filterId(1, 2, 88)).thenReturn(client);
        when(repository.saveAndFlush(any())).thenAnswer(invocation -> { CustomerAttendance a = invocation.getArgument(0); a.setId(10); return a; });
        var created = service.create(new com.concierge.apiconcierge.dtos.crm.attendance.AttendanceCreateDto(88, 700, " Notes "), "user");
        assertEquals(10, created.id()); assertNull(created.visitId()); assertNull(created.dateVisit());
        assertEquals(88, created.clientId()); assertEquals("Client", created.clientName());
        assertEquals(AttendanceStatus.COMMERCIAL_PROPOSAL, created.status()); assertEquals("Notes", created.notes());
        verifyNoInteractions(visitRepository);
    }

    @Test void rejectsDirectAttendanceForAnotherSalesperson() {
        assertThrows(BusinessException.class, () -> service.create(new com.concierge.apiconcierge.dtos.crm.attendance.AttendanceCreateDto(88, 701, ""), "user"));
        verify(repository, never()).saveAndFlush(any());
        verifyNoInteractions(clientRepository, visitRepository);
    }

    @Test void rejectsDirectAttendanceForAnInvalidClientOrSalesperson() {
        var request = new com.concierge.apiconcierge.dtos.crm.attendance.AttendanceCreateDto(88, 700, "");
        assertThrows(BusinessException.class, () -> service.create(request, "user"));
        Salesperson salesperson = new Salesperson(); salesperson.setId(700); salesperson.setStatus(StatusEnableDisable.Habilitado);
        when(salespersonRepository.findByCompanyIdAndResaleIdAndId(1, 2, 700)).thenReturn(salesperson);
        assertThrows(BusinessException.class, () -> service.create(request, "user"));
        var client = new com.concierge.apiconcierge.models.clientcompany.ClientCompany(); client.setStatus(StatusEnableDisable.Desabilitado);
        when(clientRepository.filterId(1, 2, 88)).thenReturn(client);
        assertThrows(BusinessException.class, () -> service.create(request, "user"));
        verify(repository, never()).saveAndFlush(any());
    }

    @Test void loadsDirectAttendanceWithoutLookingUpAVisit() {
        CustomerAttendance a = attendance(1, 700); a.setCompanyId(1); a.setResaleId(2); a.setVisitId(null);
        when(repository.findByCompanyIdAndResaleIdAndId(1, 2, 1)).thenReturn(Optional.of(a));
        var detail = service.detail(1, "user");
        assertNull(detail.visit()); assertEquals(1, detail.attendance().id());
        verifyNoInteractions(visitRepository);
    }

    @Test void permission400AloneDoesNotAllowCreatingForAnotherSalesperson() {
        lenient().when(permissionRepository.findPermissionId(1, 2, 9, 400)).thenReturn(new PermissionUser());
        assertThrows(BusinessException.class, () -> service.create(new com.concierge.apiconcierge.dtos.crm.attendance.AttendanceCreateDto(88, 701, ""), "user"));
        verify(repository, never()).saveAndFlush(any());
    }

    @Test void permission402AllowsCreatingForAnotherSalespersonWithoutSalespersonAssociation() {
        when(permissionRepository.findPermissionId(1, 2, 9, 402)).thenReturn(new PermissionUser());
        Salesperson seller = new Salesperson(); seller.setId(701); seller.setName("Seller"); seller.setStatus(StatusEnableDisable.Habilitado);
        when(salespersonRepository.findByCompanyIdAndResaleIdAndId(1, 2, 701)).thenReturn(seller);
        var client = new com.concierge.apiconcierge.models.clientcompany.ClientCompany(); client.setId(88); client.setName("Client"); client.setStatus(StatusEnableDisable.Habilitado);
        when(clientRepository.filterId(1, 2, 88)).thenReturn(client);
        when(repository.saveAndFlush(any())).thenAnswer(invocation -> invocation.getArgument(0));
        var created = service.create(new com.concierge.apiconcierge.dtos.crm.attendance.AttendanceCreateDto(88, 701, ""), "user");
        assertEquals(701, created.salespersonId());
        verify(salespersonRepository, never()).findByCompanyIdAndResaleIdAndUserId(any(), any(), any());
    }

    @Test void creationOptionsShowOnlyOwnSellerWithout402AndAllEnabledSellersWith402() {
        Salesperson own = new Salesperson(); own.setId(700); own.setStatus(StatusEnableDisable.Habilitado);
        Salesperson other = new Salesperson(); other.setId(701); other.setStatus(StatusEnableDisable.Habilitado);
        Salesperson disabled = new Salesperson(); disabled.setId(702); disabled.setStatus(StatusEnableDisable.Desabilitado);
        when(salespersonRepository.findByCompanyIdAndResaleId(1, 2)).thenReturn(List.of(own, other, disabled));
        assertEquals(List.of(700), service.creationSalespersons("user").stream().map(person -> person.id()).toList());
        when(permissionRepository.findPermissionId(1, 2, 9, 402)).thenReturn(new PermissionUser());
        assertEquals(List.of(700, 701), service.creationSalespersons("user").stream().map(person -> person.id()).toList());
    }

    @Test void permission402DoesNotGrantAccessToAnotherSellersAttendance() {
        lenient().when(permissionRepository.findPermissionId(1, 2, 9, 402)).thenReturn(new PermissionUser());
        when(repository.findByCompanyIdAndResaleIdAndId(1, 2, 1)).thenReturn(Optional.of(attendance(1, 701)));
        assertThrows(BusinessException.class, () -> service.authorizedAttendance(1, "user"));
    }

    @BeforeEach void prepareUser() {
        lenient().when(repository.findForQuote(anyInt(), anyInt(), anyInt())).thenAnswer(call -> repository.findByCompanyIdAndResaleIdAndId(call.getArgument(0), call.getArgument(1), call.getArgument(2)).orElse(null));
        User user = new User(); user.setName("Operador"); user.setId(9); user.setCompanyId(1); user.setResaleId(2); user.setStatus(StatusEnableDisable.Habilitado);
        Salesperson salesperson = new Salesperson(); salesperson.setId(700); salesperson.setStatus(StatusEnableDisable.Habilitado);
        lenient().when(userRepository.loginEmail("user")).thenReturn(user);
        lenient().when(salespersonRepository.findByCompanyIdAndResaleIdAndUserId(1, 2, 9)).thenReturn(salesperson);
    }

    private CustomerAttendance attendance(int id, int salespersonId) {
        CustomerAttendance a = new CustomerAttendance(); a.setId(id); a.setVisitId(42); a.setClientId(77); a.setSalespersonId(salespersonId); a.setVersion(0L); return a;
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
        doReturn(a).when(repository).findForQuote(1, 2, 1);
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
        doReturn(a).when(repository).findForQuote(1, 2, 1);
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
    @org.junit.jupiter.params.ParameterizedTest
    @org.junit.jupiter.params.provider.EnumSource(value=AttendanceStatus.class, names={"PAYMENT_PENDING","INVOICING_PENDING","DELIVERY_PENDING"})
    void savesTheNewWorkflowStages(AttendanceStatus status) {
        CustomerAttendance a=attendance(1,700);
        when(repository.findByCompanyIdAndResaleIdAndId(1,2,1)).thenReturn(Optional.of(a));
        when(repository.saveAndFlush(a)).thenAnswer(invocation->{ a.setVersion(1L);return a; });
        var result=service.update(new AttendanceUpdateDto(1,status,"Acompanhamento",0L),"user");
        assertEquals(status,result.status());assertEquals(1L,result.version());assertNull(a.getCompletedAt());
    }

    @Test void savesAndClearsExpectedDeliveryDateWithoutTimeZoneConversion() {
        CustomerAttendance a=attendance(1,700);
        when(repository.findByCompanyIdAndResaleIdAndId(1,2,1)).thenReturn(Optional.of(a));
        when(repository.saveAndFlush(a)).thenAnswer(invocation->{a.setVersion(a.getVersion()+1);return a;});
        var date=java.time.LocalDate.of(2026,12,15);
        var saved=service.update(new AttendanceUpdateDto(1,AttendanceStatus.QUOTATION,"",0L,null,null,null,date),"user");
        assertEquals(date,a.getExpectedDeliveryDate());assertEquals(date,saved.expectedDeliveryDate());
        var cleared=service.update(new AttendanceUpdateDto(1,AttendanceStatus.QUOTATION,"",1L,null,null,null,null),"user");
        assertNull(a.getExpectedDeliveryDate());assertNull(cleared.expectedDeliveryDate());
    }

    @Test void updatesTheSalespersonIdAndNameWhenReassignmentIsPermitted() {
        var a=attendance(1,700);when(repository.findByCompanyIdAndResaleIdAndId(1,2,1)).thenReturn(Optional.of(a));
        doReturn(null).when(permissionRepository).findPermissionId(1,2,9,400);
        doReturn(new PermissionUser()).when(permissionRepository).findPermissionId(1,2,9,402);
        var seller=new Salesperson();seller.setId(701);seller.setName("Novo vendedor");seller.setStatus(StatusEnableDisable.Habilitado);
        when(salespersonRepository.findByCompanyIdAndResaleIdAndId(1,2,701)).thenReturn(seller);
        when(repository.saveAndFlush(a)).thenReturn(a);
        var response=service.update(new AttendanceUpdateDto(1,AttendanceStatus.COMMERCIAL_PROPOSAL,"",0L,null,null,null,null,701),"user");
        assertEquals(701,a.getSalespersonId());assertEquals("Novo vendedor",a.getSalespersonName());assertEquals(701,response.salespersonId());assertEquals("Novo vendedor",response.salespersonName());
    }
    @Test void rejectsSalespersonReassignmentWithoutPermission() {
        var a=attendance(1,700);when(repository.findByCompanyIdAndResaleIdAndId(1,2,1)).thenReturn(Optional.of(a));
        assertThrows(BusinessException.class,()->service.update(new AttendanceUpdateDto(1,AttendanceStatus.COMMERCIAL_PROPOSAL,"",0L,null,null,null,null,701),"user"));
        assertEquals(700,a.getSalespersonId());verify(repository,never()).saveAndFlush(any());
    }
    @Test void rejectsDisabledOrOutOfScopeSalesperson() {
        var a=attendance(1,700);when(repository.findByCompanyIdAndResaleIdAndId(1,2,1)).thenReturn(Optional.of(a));doReturn(null).when(permissionRepository).findPermissionId(1,2,9,400);
        doReturn(new PermissionUser()).when(permissionRepository).findPermissionId(1,2,9,402);
        var request=new AttendanceUpdateDto(1,AttendanceStatus.COMMERCIAL_PROPOSAL,"",0L,null,null,null,null,701);
        assertThrows(BusinessException.class,()->service.update(request,"user"));
        var seller=new Salesperson();seller.setId(701);seller.setStatus(StatusEnableDisable.Desabilitado);when(salespersonRepository.findByCompanyIdAndResaleIdAndId(1,2,701)).thenReturn(seller);
        assertThrows(BusinessException.class,()->service.update(request,"user"));assertEquals(700,a.getSalespersonId());verify(repository,never()).saveAndFlush(any());
    }


    @Test void listsPaymentTotalsForAuthorizedAttendancesAndDefaultsToZero() {
        when(repository.search(eq(1), eq(2), nullable(Integer.class), eq(AttendanceStatus.CANCELLED), eq(false), nullable(Integer.class), eq(""), eq(""))).thenReturn(List.of(attendance(1,700),attendance(2,700)));
        when(documentRepository.findReceiptTotals(List.of(1,2), AttendanceDocumentStage.PAYMENT)).thenReturn(List.of(new com.concierge.apiconcierge.dtos.crm.attendance.QuoteTotalDto(1,new java.math.BigDecimal("125.50"))));
        var result=service.list("user");
        assertEquals(new java.math.BigDecimal("125.50"),result.get(0).paymentTotal());
        assertEquals(java.math.BigDecimal.ZERO,result.get(1).paymentTotal());
        verify(documentRepository).findReceiptTotals(List.of(1,2),AttendanceDocumentStage.PAYMENT);
    }

    @Test void readsLogsOnlyAfterAttendanceAuthorization() {
        var a=attendance(1,700);a.setCompanyId(1);a.setResaleId(2);when(repository.findByCompanyIdAndResaleIdAndId(1,2,1)).thenReturn(Optional.of(a));
        var log=new AttendanceLog();log.setId(5L);log.setUserName("Operador");log.setAction(AttendanceLogAction.DOCUMENT_REMOVED);log.setFileName("proposta.pdf");
        when(logRepository.findByCompanyIdAndResaleIdAndAttendanceIdOrderByOccurredAtDescIdDesc(1,2,1)).thenReturn(List.of(log));
        var entries=service.logs(1,"user");assertEquals(1,entries.size());assertEquals("proposta.pdf",entries.get(0).fileName());assertEquals("Operador",entries.get(0).userName());
    }
    @Test void refusesLogsForAnotherSalesperson() {
        when(repository.findByCompanyIdAndResaleIdAndId(1,2,1)).thenReturn(Optional.of(attendance(1,701)));
        assertThrows(BusinessException.class,()->service.logs(1,"user"));verifyNoInteractions(logRepository);
    }

    @Test void completedAttendanceCannotBeUpdatedOrCancelled() {
        CustomerAttendance a=attendance(1,700); a.setCompanyId(1); a.setResaleId(2); a.setStatus(AttendanceStatus.COMPLETED);
        when(repository.findByCompanyIdAndResaleIdAndId(1,2,1)).thenReturn(Optional.of(a));
        assertThrows(BusinessException.class, () -> service.update(new AttendanceUpdateDto(1,AttendanceStatus.QUOTATION,"alterado",0L),"user"));
        assertThrows(BusinessException.class, () -> service.cancel(new com.concierge.apiconcierge.dtos.crm.attendance.AttendanceCancelDto(1,0L,"cancelar"),"user"));
        verify(repository,never()).saveAndFlush(any());
        assertEquals(AttendanceStatus.COMPLETED,a.getStatus());
    }


    @Test void directAttendanceRequiresARegisteredClient() {
        assertThrows(BusinessException.class, () -> service.create(new com.concierge.apiconcierge.dtos.crm.attendance.AttendanceCreateDto(null,700,""),"user"));
        assertThrows(BusinessException.class, () -> service.create(new com.concierge.apiconcierge.dtos.crm.attendance.AttendanceCreateDto(0,700,""),"user"));
        verify(repository,never()).saveAndFlush(any());
    }
    @Test void visitAttendanceWithoutClientCannotSaveAnyStageUntilClientIsLinked() {
        CustomerAttendance a=attendance(1,700); a.setCompanyId(1); a.setResaleId(2); a.setClientId(null);
        when(repository.findByCompanyIdAndResaleIdAndId(1,2,1)).thenReturn(Optional.of(a));
        for (AttendanceStatus status: AttendanceStatus.values()) {
            if (status == AttendanceStatus.CANCELLED) continue;
            assertThrows(BusinessException.class, () -> service.update(new AttendanceUpdateDto(1,status,"notas",0L),"user"));
        }
        verify(repository,never()).saveAndFlush(any());
        var client=new com.concierge.apiconcierge.models.clientcompany.ClientCompany();client.setId(88);client.setName("Cliente cadastrado");client.setStatus(StatusEnableDisable.Habilitado);
        when(clientRepository.filterId(1,2,88)).thenReturn(client);
        when(repository.saveAndFlush(a)).thenReturn(a);
        var result=service.update(new AttendanceUpdateDto(1,AttendanceStatus.COMMERCIAL_PROPOSAL,"",0L,"","",88),"user");
        assertEquals(88,result.clientId());assertEquals("Cliente cadastrado",result.clientName());
        assertEquals(42,a.getVisitId());
    }
}
