package com.concierge.apiconcierge.services.crm.visit;
import com.concierge.apiconcierge.dtos.crm.agenda.SalespersonVisitAgendaNewDto;
import com.concierge.apiconcierge.dtos.crm.agenda.SalespersonVisitAgendaUpdateDto;
import com.concierge.apiconcierge.exceptions.BusinessException;
import com.concierge.apiconcierge.models.crm.visit.*;
import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.permission.PermissionUser;
import com.concierge.apiconcierge.models.salesperson.Salesperson;
import com.concierge.apiconcierge.models.user.User;
import com.concierge.apiconcierge.repositories.crm.visit.ISalespersonVisitRepository;
import com.concierge.apiconcierge.repositories.permission.IPermissionUserRepository;
import com.concierge.apiconcierge.repositories.salesperson.ISalespersonRepository;
import com.concierge.apiconcierge.repositories.user.IUserRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VisitCreationPermissionsTest {
    @Mock ISalespersonVisitRepository repository;
    @Mock IUserRepository userRepository;
    @Mock ISalespersonRepository salespersonRepository;
    @Mock IPermissionUserRepository permissionUser;
    @InjectMocks SalespersonVisitService service;
    User user;
    Salesperson own, other;
    @BeforeEach void setup() {
        user = new User(); user.setId(9); user.setCompanyId(1); user.setResaleId(2); user.setStatus(StatusEnableDisable.Habilitado);
        own = seller(7); other = seller(8);
        lenient().when(userRepository.loginEmail("user")).thenReturn(user);
        lenient().when(salespersonRepository.findByCompanyIdAndResaleIdAndUserId(1,2,9)).thenReturn(own);
        lenient().when(salespersonRepository.findByCompanyIdAndResaleIdAndId(1,2,7)).thenReturn(own);
        lenient().when(salespersonRepository.findByCompanyIdAndResaleIdAndId(1,2,8)).thenReturn(other);
        lenient().when(repository.save(any())).thenAnswer(i -> i.getArgument(0));
    }
    Salesperson seller(int id) { Salesperson s = new Salesperson(); s.setId(id); s.setName("Seller " + id); s.setStatus(StatusEnableDisable.Habilitado); return s; }
    SalespersonVisit visit(int seller) { SalespersonVisit v = new SalespersonVisit(); v.setSalespersonId(seller); v.setSalespersonName("Spoofed"); return v; }
    SalespersonVisitAgendaNewDto agenda(int seller) { return new SalespersonVisitAgendaNewDto(new Date(), seller, "Spoofed", 3, "Client", "", "", ""); }
    void grant(int id) { when(permissionUser.findPermissionId(1,2,9,id)).thenReturn(new PermissionUser()); }

    @Test void ownSellerCanScheduleAndRegisterWithoutGlobalPermissions() {
        assertNotNull(service.agendaNew(agenda(7),"user"));
        var saved=service.registerNew(visit(7),"user");
        assertEquals("Seller 7", saved.getSalespersonName()); assertEquals(1,saved.getCompanyId()); assertEquals(2,saved.getResaleId());
    }
    @Test void permission403AllowsSchedulingButNotRegisteringForOthers() {
        grant(403);
        assertNotNull(service.agendaNew(agenda(8),"user"));
        assertThrows(BusinessException.class,()->service.registerNew(visit(8),"user"));
        verify(repository,times(1)).save(any());
    }
    @Test void permission404AllowsRegisteringButNotSchedulingForOthers() {
        grant(404);
        assertEquals(8,service.registerNew(visit(8),"user").getSalespersonId());
        assertThrows(BusinessException.class,()->service.agendaNew(agenda(8),"user"));
        verify(repository,times(1)).save(any());
    }
    @Test void listAndAttendancePermissionsDoNotGrantVisitCreationForOthers() {
        for(int id: List.of(400,401,402)) lenient().when(permissionUser.findPermissionId(1,2,9,id)).thenReturn(new PermissionUser());
        assertThrows(BusinessException.class,()->service.agendaNew(agenda(8),"user"));
        assertThrows(BusinessException.class,()->service.registerNew(visit(8),"user"));
        verify(repository,never()).save(any());
    }
    @Test void globalPermissionsStillRejectDisabledOrOutOfScopeSellers() {
        grant(403); grant(404); other.setStatus(StatusEnableDisable.Desabilitado);
        assertThrows(BusinessException.class,()->service.agendaNew(agenda(8),"user"));
        assertThrows(BusinessException.class,()->service.registerNew(visit(8),"user"));
        assertThrows(BusinessException.class,()->service.agendaNew(agenda(99),"user"));
        assertThrows(BusinessException.class,()->service.registerNew(visit(99),"user"));
        verify(repository,never()).save(any());
    }
    @Test void eachSellerDropdownUsesOnlyItsOwnPermission() {
        var disabled=seller(10); disabled.setStatus(StatusEnableDisable.Desabilitado);
        when(salespersonRepository.findByCompanyIdAndResaleId(1,2)).thenReturn(List.of(own,other,disabled));
        assertEquals(List.of(7),service.creationSalespersons(true,"user").stream().map(s->s.id()).toList());
        assertEquals(List.of(7),service.creationSalespersons(false,"user").stream().map(s->s.id()).toList());
        grant(403);
        assertEquals(List.of(7,8),service.creationSalespersons(true,"user").stream().map(s->s.id()).toList());
        assertEquals(List.of(7),service.creationSalespersons(false,"user").stream().map(s->s.id()).toList());
        grant(404);
        assertEquals(List.of(7,8),service.creationSalespersons(false,"user").stream().map(s->s.id()).toList());
    }
    @Test void cannotTakeOverAnotherSellersVisitByChangingTheIncomingSeller() {
        var existing=visit(8); existing.setId(42);
        when(repository.findForCompletion(1,2,42)).thenReturn(existing);
        var incoming=visit(7); incoming.setId(42);
        assertThrows(BusinessException.class,()->service.registerUpdate(incoming,"user"));
        verify(repository,never()).save(any());
    }
    @Test void cannotTakeOverAnotherSellersAgendaByChangingTheIncomingSeller() {
        var existing=visit(8); existing.setId(42); existing.setStatus(StatusVisitEnum.agendado); existing.setUserIdRegister(9);
        when(repository.findForCompletion(1,2,42)).thenReturn(existing);
        var data=new SalespersonVisitAgendaUpdateDto(42,new Date(),7,"Seller",3,"Client","","","");
        assertThrows(BusinessException.class,()->service.agendaUpdate(data,"user"));
        verify(repository,never()).save(any());
    }
    @Test void globalPermissionDoesNotRequireAnOwnSalespersonAssociation() {
        grant(404);
        assertNotNull(service.registerNew(visit(8),"user"));
        verify(salespersonRepository,never()).findByCompanyIdAndResaleIdAndUserId(any(),any(),any());
    }
}
