package com.concierge.apiconcierge.services.crm.visit;

import com.concierge.apiconcierge.dtos.crm.agenda.SalespersonVisitAgendaUpdateDto;
import com.concierge.apiconcierge.exceptions.*;
import com.concierge.apiconcierge.models.crm.visit.*;
import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.salesperson.Salesperson;
import com.concierge.apiconcierge.models.user.User;
import com.concierge.apiconcierge.repositories.crm.visit.ISalespersonVisitRepository;
import com.concierge.apiconcierge.repositories.user.IUserRepository;
import com.concierge.apiconcierge.repositories.salesperson.ISalespersonRepository;
import com.concierge.apiconcierge.repositories.permission.IPermissionUserRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Date;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VisitAgendaUpdateTest {
    @Mock ISalespersonVisitRepository repository;
    @Mock IUserRepository userRepository;
    @Mock ISalespersonRepository salespersonRepository;
    @Mock IPermissionUserRepository permissionUser;
    @InjectMocks SalespersonVisitService service;
    User user;
    SalespersonVisit visit;
    SalespersonVisitAgendaUpdateDto data() { return new SalespersonVisitAgendaUpdateDto(42, new Date(2000000), 8, "Vendedor", 9, "Cliente", "12345678000190", "", "  Novo horario  "); }
    @BeforeEach void setup() {
        user = new User(); user.setId(7); user.setCompanyId(1); user.setResaleId(2); user.setStatus(StatusEnableDisable.Habilitado);
        visit = new SalespersonVisit(); visit.setId(42); visit.setCompanyId(1); visit.setResaleId(2); visit.setStatus(StatusVisitEnum.agendado); visit.setUserIdRegister(7); visit.setDateRegister(new Date(1000));
        when(userRepository.loginEmail("user")).thenReturn(user);
        lenient().when(repository.findForCompletion(1, 2, 42)).thenReturn(visit);
        Salesperson seller = new Salesperson(); seller.setId(8); seller.setName("Vendedor cadastrado"); seller.setStatus(StatusEnableDisable.Habilitado);
        lenient().when(salespersonRepository.findByCompanyIdAndResaleIdAndId(1, 2, 8)).thenReturn(seller);
    }
    @Test void updatesOnlyTheScheduleAndPreservesRegistrationAndScope() {
        assertNotNull(service.agendaUpdate(data(), "user"));
        assertEquals(new Date(2000000), visit.getAgendaDate()); assertEquals("Novo horario", visit.getAgendaInfo());
        assertEquals(9, visit.getClientId()); assertEquals(8, visit.getSalespersonId()); assertEquals("Vendedor cadastrado", visit.getSalespersonName());
        assertEquals(StatusVisitEnum.agendado, visit.getStatus()); assertEquals(new Date(1000), visit.getDateRegister()); assertEquals(7, visit.getUserIdRegister());
        assertEquals(1, visit.getCompanyId()); assertEquals(2, visit.getResaleId()); verify(repository).save(visit);
    }
    @Test void rejectsStartedAndCompletedVisits() {
        visit.setStatus(StatusVisitEnum.iniciou); assertThrows(BusinessException.class, () -> service.agendaUpdate(data(), "user"));
        visit.setStatus(StatusVisitEnum.concluído); assertThrows(BusinessException.class, () -> service.agendaUpdate(data(), "user"));
        verify(repository, never()).save(any());
    }
    @Test void rejectsVisitsOutsideTheAuthenticatedScope() {
        when(repository.findForCompletion(1, 2, 42)).thenReturn(null);
        assertThrows(ResourcesNotFoundException.class, () -> service.agendaUpdate(data(), "user")); verify(repository, never()).save(any());
    }
    @Test void rejectsUnrelatedUsersWithoutPermission() {
        visit.setUserIdRegister(99);
        assertThrows(BusinessException.class, () -> service.agendaUpdate(data(), "user")); verify(repository, never()).save(any());
    }
    @Test void rejectsDisabledUsers() {
        user.setStatus(StatusEnableDisable.Desabilitado);
        assertThrows(BusinessException.class, () -> service.agendaUpdate(data(), "user")); verify(repository, never()).save(any());
    }
}
