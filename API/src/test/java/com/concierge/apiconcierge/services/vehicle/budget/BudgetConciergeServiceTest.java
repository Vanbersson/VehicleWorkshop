package com.concierge.apiconcierge.services.vehicle.budget;
import com.concierge.apiconcierge.dtos.vehicle.budget.BudgetConciergeCreate;
import com.concierge.apiconcierge.models.vehicle.budget.BudgetConcierge;
import com.concierge.apiconcierge.models.vehicle.entry.VehicleEntry;
import com.concierge.apiconcierge.models.vehicle.enums.StatusVehicleEnum;
import com.concierge.apiconcierge.models.budget.enums.StatusBudgetEnum;
import com.concierge.apiconcierge.models.user.*;
import com.concierge.apiconcierge.models.clientcompany.ClientCompany;
import com.concierge.apiconcierge.repositories.vehicle.budget.IBudgetConciergeRepository;
import com.concierge.apiconcierge.repositories.vehicle.entry.IVehicleEntryRepository;
import com.concierge.apiconcierge.repositories.user.IUserRepository;
import com.concierge.apiconcierge.repositories.payment.ITypePaymentRepository;
import com.concierge.apiconcierge.repositories.clientcompany.IClientCompanyRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;
import java.util.Optional;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
@ExtendWith(MockitoExtension.class)
class BudgetConciergeServiceTest {
    @Mock IBudgetConciergeRepository budgets;
    @Mock IVehicleEntryRepository vehicles;
    @Mock IUserRepository users;
    @Mock com.concierge.apiconcierge.repositories.permission.IPermissionUserRepository permissions;
    @Mock com.concierge.apiconcierge.repositories.salesperson.ISalespersonRepository salespeople;
    @Mock ITypePaymentRepository payments;
    @Mock IClientCompanyRepository clients;
    @Mock com.concierge.apiconcierge.repositories.vehicle.budget.IBudgetConciergeDocumentRepository documents;
    @InjectMocks BudgetConciergeService service;
    private User generator;
    @BeforeEach void setup() {
        generator=new User(); generator.setId(9); generator.setName("Gerador"); generator.setCompanyId(1); generator.setResaleId(2); generator.setRoleFunc(UserRoleEnum.ADMIN);
        when(users.loginEmail("user")).thenReturn(generator);
        var seller = new com.concierge.apiconcierge.models.salesperson.Salesperson();
        seller.setId(9); seller.setUserId(9); seller.setCompanyId(1); seller.setResaleId(2); seller.setName("Vendedor"); seller.setStatus(com.concierge.apiconcierge.models.enums.StatusEnableDisable.Habilitado);
        lenient().when(salespeople.findByCompanyIdAndResaleIdAndId(1,2,9)).thenReturn(seller);
    }
    @Test void refusesOtherTenantBeforeReadingBudgets() {
        assertThrows(ResponseStatusException.class,()->service.list(1,3,"user")); verifyNoInteractions(budgets);
    }
    @Test void refusesCreationForDisabledUser() {
        generator.setStatus(com.concierge.apiconcierge.models.enums.StatusEnableDisable.Desabilitado);
        assertThrows(ResponseStatusException.class,()->service.create(1,2,new BudgetConciergeCreate(7,null,null,""),"user"));
        verifyNoInteractions(budgets,vehicles);
    }
    @Test void generatesIdentityAndSnapshotsWithoutBudgetPermission() {
        generator.setRoleFunc(null);
        VehicleEntry vehicle=new VehicleEntry(); vehicle.setId(7); vehicle.setStatus(StatusVehicleEnum.Entered); vehicle.setClientCompanyId(4); vehicle.setSalespersonId(9);
        ClientCompany client=new ClientCompany(); client.setId(4); client.setName("Cliente");
        when(vehicles.filterId(1,2,7)).thenReturn(vehicle); when(clients.filterId(1,2,4)).thenReturn(client); lenient().when(users.findById(9)).thenReturn(Optional.of(generator));
        when(budgets.saveAndFlush(any())).thenAnswer(call->call.getArgument(0));
        var result=service.create(1,2,new BudgetConciergeCreate(7,null,null," Observacao "),"user");
        assertEquals(1,result.getCompanyId()); assertEquals(2,result.getResaleId()); assertEquals(9,result.getGenerationUserId()); assertEquals("Gerador",result.getGenerationUserName()); assertNotNull(result.getGenerationDate());
        assertEquals(StatusBudgetEnum.OpenBudget,result.getStatus()); assertEquals(7,result.getVehicleId()); assertEquals(4,result.getClientCompanyId()); assertEquals("Cliente",result.getClientCompanyName()); assertNull(result.getDateAuthorization()); assertEquals("Observacao",result.getInformation());
    }

    @Test void listsBudgetsWithoutBudgetPermission() {
        generator.setRoleFunc(null);
        service.list("user");
        verify(budgets).listOwnByStatus(1,2,StatusBudgetEnum.OpenBudget,9);
    }
    @Test void updatesBudgetWithoutBudgetPermission() {
        generator.setRoleFunc(null);
        setupVehicleForItems();
        var budget = new com.concierge.apiconcierge.models.vehicle.budget.BudgetConcierge(); budget.setSalespersonUserId(9);
        budget.setVehicleId(7); budget.setStatus(StatusBudgetEnum.OpenBudget);
        when(budgets.lockBudget(1,2,5)).thenReturn(Optional.of(budget));
        when(budgets.saveAndFlush(any())).thenAnswer(call->call.getArgument(0));
        assertSame(budget,service.update(1,2,5,new BudgetConciergeCreate(7,null,null,""),"user"));
    }
    @Test void listsRequestedStatusWithVehiclePlate() {
        var budget = new BudgetConcierge(); budget.setSalespersonUserId(9); budget.setId(15); budget.setVehicleId(7); budget.setStatus(StatusBudgetEnum.CompleteBudget);
        var row = mock(IBudgetConciergeRepository.BudgetListRow.class);
        when(row.getBudget()).thenReturn(budget);
        when(row.getVehiclePlate()).thenReturn("ABC1D23");
        when(budgets.listOwnByStatus(1,2,StatusBudgetEnum.CompleteBudget,9)).thenReturn(java.util.List.of(row));
        var result = service.list("user", StatusBudgetEnum.CompleteBudget);
        assertEquals(1,result.size()); assertEquals("ABC1D23",result.get(0).getVehiclePlate());
        verify(budgets).listOwnByStatus(1,2,StatusBudgetEnum.CompleteBudget,9);
        verify(budgets,never()).listOwnByStatus(1,2,StatusBudgetEnum.OpenBudget,9);
    }
    @Test void queriesCancelledBudgetsSeparately() {
        service.list("user",StatusBudgetEnum.CancelledBudget);
        verify(budgets).listOwnByStatus(1,2,StatusBudgetEnum.CancelledBudget,9);
    }
    private void setupVehicleForItems() {
        VehicleEntry vehicle=new VehicleEntry(); vehicle.setId(7); vehicle.setStatus(StatusVehicleEnum.Entered); vehicle.setClientCompanyId(4); vehicle.setSalespersonId(9);
        ClientCompany client=new ClientCompany(); client.setId(4); client.setName("Cliente");
        when(vehicles.filterId(1,2,7)).thenReturn(vehicle); when(clients.filterId(1,2,4)).thenReturn(client); lenient().when(users.findById(9)).thenReturn(Optional.of(generator));
    }
    @Test void savesItemsWithTheBudgetAndDerivesTheirTenantAndParent() {
        setupVehicleForItems(); when(budgets.saveAndFlush(any())).thenAnswer(call->call.getArgument(0));
        var item=new com.concierge.apiconcierge.dtos.vehicle.budget.BudgetConciergeItemCreate(0," Peca ",new java.math.BigDecimal("2"),null,new java.math.BigDecimal("10.125"),new java.math.BigDecimal("0.25"));
        var serviceItem=new com.concierge.apiconcierge.dtos.vehicle.budget.BudgetConciergeItemCreate(1,"Reparo",new java.math.BigDecimal("1"),new java.math.BigDecimal("1.50"),new java.math.BigDecimal("100"),java.math.BigDecimal.ZERO);
        var result=service.create(1,2,new BudgetConciergeCreate(7,null,null,"",java.util.List.of(item,serviceItem)),"user");
        assertEquals(2,result.getItems().size());
        assertEquals(Integer.valueOf(0),result.getItems().get(0).getType()); assertEquals(Integer.valueOf(1),result.getItems().get(1).getType());
        for(var line:result.getItems()) { assertSame(result,line.getBudget()); assertEquals(1,line.getCompanyId()); assertEquals(2,line.getResaleId()); }
        assertEquals("Peca",result.getItems().get(0).getDescription()); assertEquals(new java.math.BigDecimal("10.125"),result.getItems().get(0).getPrice()); assertEquals(new java.math.BigDecimal("1.50"),result.getItems().get(1).getHourService());
    }
    @Test void refusesMissingHoursOrExcessiveDiscountBeforeSavingBudget() {
        setupVehicleForItems();
        var line=new com.concierge.apiconcierge.dtos.vehicle.budget.BudgetConciergeItemCreate(1,"Reparo",java.math.BigDecimal.ONE,null,new java.math.BigDecimal("100"),java.math.BigDecimal.ZERO);
        assertThrows(com.concierge.apiconcierge.exceptions.BusinessException.class,()->service.create(1,2,new BudgetConciergeCreate(7,null,null,"",java.util.List.of(line)),"user"));
        var discounted=new com.concierge.apiconcierge.dtos.vehicle.budget.BudgetConciergeItemCreate(0,"Peca",java.math.BigDecimal.ONE,null,new java.math.BigDecimal("100"),new java.math.BigDecimal("101"));
        assertThrows(com.concierge.apiconcierge.exceptions.BusinessException.class,()->service.create(1,2,new BudgetConciergeCreate(7,null,null,"",java.util.List.of(discounted)),"user")); verifyNoInteractions(budgets);
    }

    @Test void acceptsClientAndAttendantOnBudgetWhenEntryHasNeither() {
        VehicleEntry vehicle=new VehicleEntry(); vehicle.setId(7); vehicle.setStatus(StatusVehicleEnum.Entered);
        ClientCompany client=new ClientCompany(); client.setId(4); client.setName("Cliente");
        when(vehicles.filterId(1,2,7)).thenReturn(vehicle); when(clients.filterId(1,2,4)).thenReturn(client); lenient().when(users.findById(9)).thenReturn(Optional.of(generator));
        when(budgets.saveAndFlush(any())).thenAnswer(call->call.getArgument(0));
        var result=service.create(1,2,new BudgetConciergeCreate(7,null,null,"",java.util.List.of(),4,9),"user");
        assertEquals(4,result.getClientCompanyId()); assertEquals(9,result.getSalespersonUserId()); assertNull(vehicle.getClientCompanyId()); assertNull(vehicle.getSalespersonId());
    }

    @Test void refusesBudgetWithoutSalesperson() {
        setupVehicleForItems();
        vehicles.filterId(1,2,7).setSalespersonId(null);
        assertThrows(com.concierge.apiconcierge.exceptions.BusinessException.class, () -> service.create(1,2,new BudgetConciergeCreate(7,null,null,""),"user"));
        verifyNoInteractions(budgets);
    }
    @Test void refusesSalespersonOutsideTheBudgetTenant() {
        setupVehicleForItems();
        assertThrows(com.concierge.apiconcierge.exceptions.BusinessException.class, () -> service.create(1,2,new BudgetConciergeCreate(7,null,null,"",java.util.List.of(),4,77),"user"));
        verify(salespeople).findByCompanyIdAndResaleIdAndId(1,2,77);
        verify(users,never()).findById(77);
        verifyNoInteractions(budgets);
    }
    @Test void usesVehicleSalespersonWhenNotProvided() {
        setupVehicleForItems(); when(budgets.saveAndFlush(any())).thenAnswer(call->call.getArgument(0));
        var result=service.create(1,2,new BudgetConciergeCreate(7,null,null,"",java.util.List.of(),4,null),"user");
        assertEquals(9,result.getSalespersonUserId()); assertEquals("Vendedor",result.getSalespersonUserName()); assertEquals(4,result.getClientCompanyId());
    }

    @Test void closesBudgetsAndRefusesLaterEditsOrStatusChanges() {
        BudgetConcierge budget=new BudgetConcierge(); budget.setSalespersonUserId(9); budget.setId(15); budget.setStatus(StatusBudgetEnum.Approved);
        when(budgets.lockBudget(1,2,15)).thenReturn(Optional.of(budget)); when(budgets.saveAndFlush(any())).thenAnswer(call->call.getArgument(0));
        service.complete(1,2,15,"user"); assertEquals(StatusBudgetEnum.CompleteBudget,budget.getStatus());
        assertThrows(com.concierge.apiconcierge.exceptions.BusinessException.class,()->service.cancel(1,2,15,"Motivo de teste","user"));
        assertThrows(com.concierge.apiconcierge.exceptions.BusinessException.class,()->service.update(1,2,15,new BudgetConciergeCreate(7,null,null,""),"user"));
        verify(budgets,times(1)).saveAndFlush(any());
    }
    @Test void cancelsWithoutDeletingBudgetOrItems() {
        BudgetConcierge budget=new BudgetConcierge(); budget.setSalespersonUserId(9); budget.setStatus(StatusBudgetEnum.OpenBudget);
        when(budgets.lockBudget(1,2,15)).thenReturn(Optional.of(budget)); when(budgets.saveAndFlush(any())).thenAnswer(call->call.getArgument(0));
        assertEquals(StatusBudgetEnum.CancelledBudget,service.cancel(1,2,15,"Motivo de teste","user").getStatus()); verify(budgets,never()).delete(any());
    }
    @Test void updatesItemsAndPreservesOriginalGeneration() {
        setupVehicleForItems();
        var shared=new com.concierge.apiconcierge.models.vehicle.budget.BudgetConciergeDocument();shared.setShareTokenHash("old");shared.setShareExpiresAt(java.time.Instant.now().plusSeconds(3600));
        when(documents.findByCompanyIdAndResaleIdAndBudgetId(1,2,15)).thenReturn(java.util.List.of(shared)); BudgetConcierge budget=new BudgetConcierge(); budget.setSalespersonUserId(9); budget.setId(15); budget.setStatus(StatusBudgetEnum.OpenBudget); budget.setVehicleId(7); budget.setGenerationUserId(77); budget.setGenerationDate(java.time.LocalDateTime.of(2026,1,1,0,0));
        when(budgets.lockBudget(1,2,15)).thenReturn(Optional.of(budget)); when(budgets.saveAndFlush(any())).thenAnswer(call->call.getArgument(0));
        var line=new com.concierge.apiconcierge.dtos.vehicle.budget.BudgetConciergeItemCreate(0,"Peca",java.math.BigDecimal.ONE,null,java.math.BigDecimal.TEN,java.math.BigDecimal.ZERO);
        var result=service.update(1,2,15,new BudgetConciergeCreate(7,null,null,"Atualizado",java.util.List.of(line)),"user");
        assertEquals(15,result.getId()); assertEquals(77,result.getGenerationUserId()); assertEquals(java.time.LocalDateTime.of(2026,1,1,0,0),result.getGenerationDate()); assertEquals("Atualizado",result.getInformation()); assertEquals(1,result.getItems().size()); assertSame(result,result.getItems().get(0).getBudget());assertNull(shared.getShareTokenHash());assertNull(shared.getShareExpiresAt());
    }

    @Test void listsOnlyAuthenticatedUsersTenant() {
        when(budgets.listOwnByStatus(1,2,StatusBudgetEnum.OpenBudget,9)).thenReturn(java.util.List.of());
        assertTrue(service.list("user").isEmpty());
        verify(budgets).listOwnByStatus(1,2,StatusBudgetEnum.OpenBudget,9);
    }
    @Test void rejectsMissingOrDisabledUsersWithoutNullPointerOrReadingBudgets() {
        when(users.loginEmail("user")).thenReturn(null);
        assertThrows(ResponseStatusException.class,()->service.list("user"));
        generator.setStatus(com.concierge.apiconcierge.models.enums.StatusEnableDisable.Desabilitado);
        when(users.loginEmail("user")).thenReturn(generator);
        var seller = new com.concierge.apiconcierge.models.salesperson.Salesperson();
        seller.setId(9); seller.setUserId(9); seller.setCompanyId(1); seller.setResaleId(2); seller.setName("Vendedor"); seller.setStatus(com.concierge.apiconcierge.models.enums.StatusEnableDisable.Habilitado);
        lenient().when(salespeople.findByCompanyIdAndResaleIdAndId(1,2,9)).thenReturn(seller);
        assertThrows(ResponseStatusException.class,()->service.list("user"));
        assertThrows(ResponseStatusException.class,()->service.create(1,2,new BudgetConciergeCreate(7,null,null,""),"user"));
        verifyNoInteractions(budgets,vehicles);
    }

    @Test void serviceIgnoresQuantityAndStoresOne() {
        setupVehicleForItems(); when(budgets.saveAndFlush(any())).thenAnswer(call->call.getArgument(0));
        var line=new com.concierge.apiconcierge.dtos.vehicle.budget.BudgetConciergeItemCreate(1,"Servico",null,new java.math.BigDecimal("1.50"),new java.math.BigDecimal("100"),new java.math.BigDecimal("10"));
        var result=service.create(1,2,new BudgetConciergeCreate(7,null,null,"",java.util.List.of(line)),"user");
        assertEquals(java.math.BigDecimal.ONE,result.getItems().get(0).getQuantity());
    }
    @Test void serviceDiscountCannotExceedHoursTimesPriceEvenWithLargeQuantity() {
        setupVehicleForItems();
        var line=new com.concierge.apiconcierge.dtos.vehicle.budget.BudgetConciergeItemCreate(1,"Servico",new java.math.BigDecimal("99"),new java.math.BigDecimal("1.50"),new java.math.BigDecimal("100"),new java.math.BigDecimal("151"));
        assertThrows(com.concierge.apiconcierge.exceptions.BusinessException.class,()->service.create(1,2,new BudgetConciergeCreate(7,null,null,"",java.util.List.of(line)),"user")); verifyNoInteractions(budgets);
    }

    @Test void editingApprovedBudgetReopensItAndClearsPreviousApproval() {
        setupVehicleForItems();var budget=new BudgetConcierge(); budget.setSalespersonUserId(9);budget.setId(15);budget.setVehicleId(7);budget.setStatus(StatusBudgetEnum.Approved);budget.setDateAuthorization(java.time.LocalDateTime.now());
        var document=new com.concierge.apiconcierge.models.vehicle.budget.BudgetConciergeDocument();document.setApprovedAt(java.time.Instant.now());document.setShareTokenHash("old");document.setShareExpiresAt(java.time.Instant.now().plusSeconds(3600));
        when(budgets.lockBudget(1,2,15)).thenReturn(Optional.of(budget));when(budgets.saveAndFlush(any())).thenAnswer(call->call.getArgument(0));when(documents.findByCompanyIdAndResaleIdAndBudgetId(1,2,15)).thenReturn(java.util.List.of(document));
        var result=service.update(1,2,15,new BudgetConciergeCreate(7,null,null,"Alterado"),"user");
        assertEquals(StatusBudgetEnum.OpenBudget,result.getStatus());assertNull(result.getDateAuthorization());assertNull(document.getApprovedAt());assertNull(document.getShareTokenHash());assertNull(document.getShareExpiresAt());
    }

    @Test void refusesBlankCancellationReasonAndPersistsTrimmedReason() {
        assertThrows(com.concierge.apiconcierge.exceptions.BusinessException.class,()->service.cancel(1,2,15,"   ","user"));verifyNoInteractions(budgets);
        var budget=new BudgetConcierge(); budget.setSalespersonUserId(9);budget.setStatus(StatusBudgetEnum.OpenBudget);when(budgets.lockBudget(1,2,15)).thenReturn(Optional.of(budget));when(budgets.saveAndFlush(any())).thenAnswer(call->call.getArgument(0));
        var result=service.cancel(1,2,15," Cliente desistiu ","user");assertEquals("Cliente desistiu",result.getCancellationReason());assertEquals(StatusBudgetEnum.CancelledBudget,result.getStatus());
    }

    @Test void refusesCompletingUnapprovedBudget() {
        var budget=new BudgetConcierge(); budget.setSalespersonUserId(9);budget.setStatus(StatusBudgetEnum.OpenBudget);when(budgets.lockBudget(1,2,15)).thenReturn(Optional.of(budget));
        assertThrows(com.concierge.apiconcierge.exceptions.BusinessException.class,()->service.complete(1,2,15,"user"));verify(budgets,never()).saveAndFlush(any());
    }
}
