package com.concierge.apiconcierge.services.crm.visit;

import com.concierge.apiconcierge.models.crm.visit.*;
import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.user.User;
import com.concierge.apiconcierge.repositories.crm.visit.ISalespersonVisitRepository;
import com.concierge.apiconcierge.repositories.user.IUserRepository;
import com.concierge.apiconcierge.services.crm.attendance.CustomerAttendanceService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VisitCompletionAttendanceTest {
    @Mock ISalespersonVisitRepository repository;
    @Mock IUserRepository userRepository;
    @Mock CustomerAttendanceService attendanceService;
    @Mock com.concierge.apiconcierge.repositories.salesperson.ISalespersonRepository salespersonRepository;
    @Mock com.concierge.apiconcierge.repositories.permission.IPermissionUserRepository permissionUser;
    @InjectMocks SalespersonVisitService service;
    @org.junit.jupiter.api.BeforeEach void authorizeOwnSeller() {
        var seller = new com.concierge.apiconcierge.models.salesperson.Salesperson(); seller.setId(7); seller.setStatus(StatusEnableDisable.Habilitado);
        when(salespersonRepository.findByCompanyIdAndResaleIdAndUserId(1, 2, null)).thenReturn(seller);
        when(salespersonRepository.findByCompanyIdAndResaleIdAndId(1, 2, 7)).thenReturn(seller);
    }

    @Test void completionPreservesTheOriginalTenantWithoutGeneratingAttendance() {
        User user = new User(); user.setCompanyId(1); user.setResaleId(2); user.setStatus(StatusEnableDisable.Habilitado);
        SalespersonVisit existing = new SalespersonVisit(); existing.setSalespersonId(7); existing.setId(42); existing.setCompanyId(1); existing.setResaleId(2);
        SalespersonVisit incoming = new SalespersonVisit(); incoming.setSalespersonId(7); incoming.setId(42); incoming.setCompanyId(999); incoming.setStatus(StatusVisitEnum.concluído);
        when(userRepository.loginEmail("user")).thenReturn(user);
        when(repository.findForCompletion(1, 2, 42)).thenReturn(existing);
        when(repository.save(incoming)).thenReturn(incoming);
        assertSame(incoming, service.registerUpdate(incoming, "user"));
        assertEquals(1, incoming.getCompanyId()); assertEquals(2, incoming.getResaleId());
        verifyNoInteractions(attendanceService);
    }

    @Test void savingADraftDoesNotGenerateAttendance() {
        User user = new User(); user.setCompanyId(1); user.setResaleId(2); user.setStatus(StatusEnableDisable.Habilitado);
        SalespersonVisit existing = new SalespersonVisit(); existing.setSalespersonId(7); existing.setCompanyId(1); existing.setResaleId(2);
        SalespersonVisit incoming = new SalespersonVisit(); incoming.setSalespersonId(7); incoming.setId(42); incoming.setStatus(StatusVisitEnum.iniciou);
        when(userRepository.loginEmail("user")).thenReturn(user);
        when(repository.findForCompletion(1, 2, 42)).thenReturn(existing);
        when(repository.save(incoming)).thenReturn(incoming);
        service.registerUpdate(incoming, "user");
        verifyNoInteractions(attendanceService);
    }

    @Test void generatesAttendanceOnlyOnExplicitRequest() {
        User user=new User();user.setCompanyId(1);user.setResaleId(2);user.setStatus(StatusEnableDisable.Habilitado);when(userRepository.loginEmail("user")).thenReturn(user);
        SalespersonVisit visit=new SalespersonVisit();visit.setId(42);visit.setCompanyId(1);visit.setResaleId(2);visit.setSalespersonId(7);visit.setStatus(StatusVisitEnum.concluído);
        when(repository.findForCompletion(1,2,42)).thenReturn(visit);
        var attendance=new com.concierge.apiconcierge.models.crm.attendance.CustomerAttendance();attendance.setId(16);attendance.setVisitId(42);when(attendanceService.createForVisit(visit)).thenReturn(attendance);
        var response=service.generateAttendance(42,"user");assertEquals(16,response.id());assertEquals(42,response.visitId());verify(attendanceService).createForVisit(visit);
    }
    @Test void draftCannotGenerateAttendance() {
        User user=new User();user.setCompanyId(1);user.setResaleId(2);user.setStatus(StatusEnableDisable.Habilitado);when(userRepository.loginEmail("user")).thenReturn(user);
        SalespersonVisit visit=new SalespersonVisit();visit.setSalespersonId(7);visit.setStatus(StatusVisitEnum.iniciou);when(repository.findForCompletion(1,2,42)).thenReturn(visit);
        assertThrows(com.concierge.apiconcierge.exceptions.BusinessException.class,()->service.generateAttendance(42,"user"));verifyNoInteractions(attendanceService);
    }
}
