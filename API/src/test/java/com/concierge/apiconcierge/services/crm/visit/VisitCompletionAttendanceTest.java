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
    @InjectMocks SalespersonVisitService service;

    @Test void completionGeneratesAttendanceAndPreservesTheOriginalTenant() {
        User user = new User(); user.setCompanyId(1); user.setResaleId(2); user.setStatus(StatusEnableDisable.Habilitado);
        SalespersonVisit existing = new SalespersonVisit(); existing.setId(42); existing.setCompanyId(1); existing.setResaleId(2);
        SalespersonVisit incoming = new SalespersonVisit(); incoming.setId(42); incoming.setCompanyId(999); incoming.setStatus(StatusVisitEnum.concluído);
        when(userRepository.loginEmail("user")).thenReturn(user);
        when(repository.findForCompletion(1, 2, 42)).thenReturn(existing);
        when(repository.save(incoming)).thenReturn(incoming);
        assertSame(incoming, service.registerUpdate(incoming, "user"));
        assertEquals(1, incoming.getCompanyId()); assertEquals(2, incoming.getResaleId());
        verify(attendanceService).createForVisit(incoming);
    }

    @Test void savingADraftDoesNotGenerateAttendance() {
        User user = new User(); user.setCompanyId(1); user.setResaleId(2); user.setStatus(StatusEnableDisable.Habilitado);
        SalespersonVisit existing = new SalespersonVisit(); existing.setCompanyId(1); existing.setResaleId(2);
        SalespersonVisit incoming = new SalespersonVisit(); incoming.setId(42); incoming.setStatus(StatusVisitEnum.iniciou);
        when(userRepository.loginEmail("user")).thenReturn(user);
        when(repository.findForCompletion(1, 2, 42)).thenReturn(existing);
        when(repository.save(incoming)).thenReturn(incoming);
        service.registerUpdate(incoming, "user");
        verifyNoInteractions(attendanceService);
    }
}
