package com.concierge.apiconcierge.services.vehicle.entry;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.enums.YesNot;
import com.concierge.apiconcierge.models.permission.PermissionUser;
import com.concierge.apiconcierge.models.user.User;
import com.concierge.apiconcierge.models.user.UserRoleEnum;
import com.concierge.apiconcierge.models.vehicle.entry.VehicleEntry;
import com.concierge.apiconcierge.repositories.user.IUserRepository;
import com.concierge.apiconcierge.repositories.permission.IPermissionUserRepository;
import com.concierge.apiconcierge.repositories.vehicle.entry.IVehicleEntryRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static com.concierge.apiconcierge.util.ConstantsPermission.EDIT_ENTRY_VEHICLE;

@ExtendWith(MockitoExtension.class)
class VehicleHistoryTest {
    @Mock IVehicleEntryRepository repository;
    @Mock IUserRepository userRepository;
    @Mock IPermissionUserRepository permissionUser;
    @InjectMocks VehicleEntryService service;
    User user; VehicleEntry current;
    @BeforeEach void setup() {
        user = new User(); user.setId(7); user.setCompanyId(1); user.setResaleId(2);
        user.setRoleFunc(UserRoleEnum.ADMIN); user.setStatus(StatusEnableDisable.Habilitado);
        current = new VehicleEntry(); current.setId(42); current.setCompanyId(1); current.setResaleId(2);
        current.setVehiclePlate("abc-1d23"); current.setVehicleNew(YesNot.not);
        when(userRepository.loginEmail("user")).thenReturn(user);
        lenient().when(repository.filterId(1,2,42)).thenReturn(current);
    }
    @Test void includesPastPassagesUsingNormalizedPlateWithinTenant() {
        VehicleEntry previous = new VehicleEntry(); previous.setId(10);
        when(repository.historyByPlate(1,2,"ABC1D23")).thenReturn(List.of(current,previous));
        assertEquals(List.of(current,previous),service.history(1,2,42,"user"));
        verify(repository).historyByPlate(1,2,"ABC1D23");
    }
    @Test void neverGroupsUnplatedVehicles() {
        current.setVehicleNew(YesNot.yes); current.setVehiclePlate("");
        assertEquals(List.of(current),service.history(1,2,42,"user"));
        verify(repository,never()).historyByPlate(any(),any(),any());
    }
    @Test void neverUsesFleetOrModelForInvalidPlate() {
        current.setVehiclePlate("NOVO");
        assertEquals(List.of(current),service.history(1,2,42,"user"));
        verify(repository,never()).historyByPlate(any(),any(),any());
    }
    @Test void rejectsAnotherCompanyBeforeQueryingVehicles() {
        assertEquals(403,assertThrows(ResponseStatusException.class,()->service.history(3,2,42,"user")).getStatusCode().value());
        verifyNoInteractions(repository);
    }
    @Test void rejectsAnotherResaleBeforeQueryingVehicles() {
        assertEquals(403,assertThrows(ResponseStatusException.class,()->service.history(1,3,42,"user")).getStatusCode().value());
        verifyNoInteractions(repository);
    }
    @Test void requiresExistingMaintenancePermissionForNonAdmin() {
        user.setRoleFunc(UserRoleEnum.USER);
        assertEquals(403,assertThrows(ResponseStatusException.class,()->service.history(1,2,42,"user")).getStatusCode().value());
        verify(permissionUser).findPermissionId(1,2,7,EDIT_ENTRY_VEHICLE);
        verifyNoInteractions(repository);
    }
    @Test void permitsAuthorizedUser() {
        user.setRoleFunc(UserRoleEnum.USER);
        when(permissionUser.findPermissionId(1,2,7,EDIT_ENTRY_VEHICLE)).thenReturn(new PermissionUser());
        when(repository.historyByPlate(1,2,"ABC1D23")).thenReturn(List.of(current));
        assertEquals(List.of(current),service.history(1,2,42,"user"));
    }
    @Test void rejectsDisabledUser() {
        user.setStatus(StatusEnableDisable.Desabilitado);
        assertEquals(403,assertThrows(ResponseStatusException.class,()->service.history(1,2,42,"user")).getStatusCode().value());
        verifyNoInteractions(repository);
    }
    @Test void returnsNotFoundForUnknownScopedAttendance() {
        when(repository.filterId(1,2,42)).thenReturn(null);
        assertEquals(404,assertThrows(ResponseStatusException.class,()->service.history(1,2,42,"user")).getStatusCode().value());
    }
}
