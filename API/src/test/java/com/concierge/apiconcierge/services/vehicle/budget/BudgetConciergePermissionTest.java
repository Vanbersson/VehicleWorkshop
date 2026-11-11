package com.concierge.apiconcierge.services.vehicle.budget;

import com.concierge.apiconcierge.dtos.vehicle.budget.BudgetConciergeCreate;
import com.concierge.apiconcierge.models.budget.enums.StatusBudgetEnum;
import com.concierge.apiconcierge.models.clientcompany.ClientCompany;
import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.permission.PermissionUser;
import com.concierge.apiconcierge.models.salesperson.Salesperson;
import com.concierge.apiconcierge.models.user.User;
import com.concierge.apiconcierge.models.user.UserRoleEnum;
import com.concierge.apiconcierge.models.vehicle.budget.BudgetConcierge;
import com.concierge.apiconcierge.models.vehicle.entry.VehicleEntry;
import com.concierge.apiconcierge.models.vehicle.enums.StatusVehicleEnum;
import com.concierge.apiconcierge.repositories.clientcompany.IClientCompanyRepository;
import com.concierge.apiconcierge.repositories.payment.ITypePaymentRepository;
import com.concierge.apiconcierge.repositories.permission.IPermissionUserRepository;
import com.concierge.apiconcierge.repositories.salesperson.ISalespersonRepository;
import com.concierge.apiconcierge.repositories.user.IUserRepository;
import com.concierge.apiconcierge.repositories.vehicle.budget.IBudgetConciergeDocumentRepository;
import com.concierge.apiconcierge.repositories.vehicle.budget.IBudgetConciergeRepository;
import com.concierge.apiconcierge.repositories.vehicle.entry.IVehicleEntryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BudgetConciergePermissionTest {
    @Mock IBudgetConciergeRepository budgets;
    @Mock IVehicleEntryRepository vehicles;
    @Mock IUserRepository users;
    @Mock ISalespersonRepository salespeople;
    @Mock IPermissionUserRepository permissions;
    @Mock ITypePaymentRepository payments;
    @Mock IClientCompanyRepository clients;
    @Mock IBudgetConciergeDocumentRepository documents;
    @InjectMocks BudgetConciergeService service;
    private User user;
    private Salesperson own;
    private Salesperson other;

    @BeforeEach void setup() {
        user = new User(); user.setId(9); user.setCompanyId(1); user.setResaleId(2); user.setName("Usuario"); user.setStatus(StatusEnableDisable.Habilitado); user.setRoleFunc(UserRoleEnum.ADMIN);
        when(users.loginEmail("user")).thenReturn(user);
        own = salesperson(17,9); other = salesperson(27,10);
        lenient().when(salespeople.findByCompanyIdAndResaleIdAndId(1,2,17)).thenReturn(own);
        lenient().when(salespeople.findByCompanyIdAndResaleIdAndId(1,2,27)).thenReturn(other);
        var vehicle = new VehicleEntry(); vehicle.setId(7); vehicle.setSalespersonId(17); vehicle.setClientCompanyId(4); vehicle.setStatus(StatusVehicleEnum.Entered);
        lenient().when(vehicles.filterId(1,2,7)).thenReturn(vehicle);
        var client = new ClientCompany(); client.setId(4); client.setName("Cliente");
        lenient().when(clients.filterId(1,2,4)).thenReturn(client);
        lenient().when(budgets.saveAndFlush(any())).thenAnswer(call -> call.getArgument(0));
    }
    private Salesperson salesperson(int id, int userId) {
        var result = new Salesperson(); result.setId(id); result.setUserId(userId); result.setCompanyId(1); result.setResaleId(2); result.setName("Vendedor " + id); result.setStatus(StatusEnableDisable.Habilitado); return result;
    }
    private BudgetConciergeCreate data(int salesperson) {
        return new BudgetConciergeCreate(7,null,null,"",List.of(),4,salesperson);
    }
    private BudgetConcierge existing(int salesperson) {
        var result = new BudgetConcierge(); result.setId(5); result.setCompanyId(1); result.setResaleId(2); result.setVehicleId(7); result.setSalespersonUserId(salesperson); result.setGenerationUserId(9); result.setStatus(StatusBudgetEnum.OpenBudget);
        lenient().when(budgets.lockBudget(1,2,5)).thenReturn(Optional.of(result));
        lenient().when(budgets.findByCompanyIdAndResaleIdAndId(1,2,5)).thenReturn(Optional.of(result));
        return result;
    }
    private void grant(int permission) {
        lenient().when(permissions.findPermissionId(1,2,9,permission)).thenReturn(new PermissionUser());
    }
    private void forbidden(Runnable operation) {
        var exception = assertThrows(ResponseStatusException.class, operation::run);
        assertEquals(403, exception.getStatusCode().value());
    }

    @Test void createsOwnBudgetWithoutPermissionUsingSalespersonUserLink() {
        var result = service.create(1,2,data(17),"user");
        assertEquals(17,result.getSalespersonUserId()); assertEquals(9,result.getGenerationUserId()); assertTrue(result.getCanEdit());
    }
    @Test void creationForOtherSellerRequires150EvenForAdmin() {
        forbidden(() -> service.create(1,2,data(27),"user"));
        verify(budgets,never()).saveAndFlush(any());
        grant(150);
        assertEquals(27,service.create(1,2,data(27),"user").getSalespersonUserId());
    }
    @ParameterizedTest @ValueSource(ints={151,152})
    void otherPermissionsDoNotGrantCreation(int permission) {
        grant(permission); forbidden(() -> service.create(1,2,data(27),"user"));
        verify(budgets,never()).saveAndFlush(any());
    }
    @Test void updatesOwnBudgetWithoutPermission() {
        var budget = existing(17);
        assertSame(budget,service.update(1,2,5,data(17),"user"));
    }
    @Test void updatingOtherSellerRequires151AndCannotBeBypassedByChangingOwner() {
        existing(27);
        forbidden(() -> service.update(1,2,5,data(17),"user"));
        verify(budgets,never()).saveAndFlush(any()); verifyNoInteractions(documents);
        grant(151);
        assertEquals(27,service.update(1,2,5,data(27),"user").getSalespersonUserId());
    }
    @Test void cannotReassignOwnBudgetToAnotherSellerWithout151() {
        var budget = existing(17);
        forbidden(() -> service.update(1,2,5,data(27),"user"));
        assertEquals(17,budget.getSalespersonUserId()); verify(budgets,never()).saveAndFlush(any()); verifyNoInteractions(documents);
    }
    @ParameterizedTest @ValueSource(ints={150,152})
    void otherPermissionsDoNotGrantEditing(int permission) {
        grant(permission); existing(27); forbidden(() -> service.update(1,2,5,data(27),"user"));
        verify(budgets,never()).saveAndFlush(any());
    }
    @Test void listsOwnBudgetsInTheDatabaseWithout152() {
        for(var status : List.of(StatusBudgetEnum.OpenBudget,StatusBudgetEnum.CompleteBudget,StatusBudgetEnum.CancelledBudget)) {
            service.list("user",status);
            verify(budgets).listOwnByStatus(1,2,status,9);
        }
        verify(budgets,never()).listByStatus(any(),any(),any());
    }
    @ParameterizedTest @ValueSource(ints={150,151})
    void creationAndEditPermissionsDoNotGrantListingAll(int permission) {
        grant(permission); service.list("user"); verify(budgets).listOwnByStatus(1,2,StatusBudgetEnum.OpenBudget,9);
        verify(budgets,never()).listByStatus(any(),any(),any());
    }
    @Test void permission152ListsAllWithoutGrantingEdit() {
        grant(152);
        var budget = existing(27);
        var row = mock(IBudgetConciergeRepository.BudgetListRow.class); when(row.getBudget()).thenReturn(budget);
        when(budgets.listByStatus(1,2,StatusBudgetEnum.OpenBudget)).thenReturn(List.of(row));
        var result = service.list("user");
        assertEquals(1,result.size()); assertFalse(result.get(0).getCanEdit());
        verify(budgets,never()).listOwnByStatus(any(),any(),any(),any());
    }
    @Test void directReadAndDocumentReadRequire152ForOtherSellers() {
        existing(27);
        forbidden(() -> service.detail(1,2,5,"user"));
        forbidden(() -> service.documentScope(1,2,5,"user",false));
        grant(152);
        assertEquals(27,service.detail(1,2,5,"user").getSalespersonUserId());
        assertNotNull(service.documentScope(1,2,5,"user",false));
    }
    @Test void ownReadAndOwnDocumentWriteNeedNoBroadPermissions() {
        existing(17);
        assertNotNull(service.detail(1,2,5,"user"));
        assertNotNull(service.documentScope(1,2,5,"user",true));
    }
    @Test void cancellingCompletingAndDocumentWriteRequire151() {
        var budget = existing(27); budget.setStatus(StatusBudgetEnum.Approved);
        forbidden(() -> service.cancel(1,2,5,"Motivo","user"));
        forbidden(() -> service.complete(1,2,5,"user"));
        forbidden(() -> service.documentScope(1,2,5,"user",true));
        verify(budgets,never()).saveAndFlush(any());
        grant(151);
        assertSame(budget,service.documentScope(1,2,5,"user",true));
        assertSame(budget,service.complete(1,2,5,"user"));
    }
    @Test void broadPermissionsNeverBypassTenantValidation() {
        grant(150); grant(151); grant(152);
        forbidden(() -> service.create(1,3,data(17),"user"));
        forbidden(() -> service.update(1,3,5,data(17),"user"));
        forbidden(() -> service.list(1,3,"user"));
        verifyNoInteractions(budgets,vehicles);
    }
    @Test void creationOptionsExposeOnlyOwnSellersUnless150IsGranted() {
        when(salespeople.findByCompanyIdAndResaleId(1,2)).thenReturn(List.of(own,other));
        assertEquals(List.of(17),service.attendants(1,2,"user").stream().map(BudgetConciergeService.AttendantOption::id).toList());
        grant(150);
        assertEquals(2,service.attendants(1,2,"user").size());
    }
}