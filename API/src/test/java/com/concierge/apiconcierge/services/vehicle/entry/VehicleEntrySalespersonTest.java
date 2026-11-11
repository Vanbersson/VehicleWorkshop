package com.concierge.apiconcierge.services.vehicle.entry;

import com.concierge.apiconcierge.exceptions.vehicle.VehicleEntryException;
import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.salesperson.Salesperson;
import com.concierge.apiconcierge.models.vehicle.entry.VehicleEntry;
import com.concierge.apiconcierge.repositories.salesperson.ISalespersonRepository;
import com.concierge.apiconcierge.repositories.vehicle.entry.IVehicleEntryRepository;
import com.concierge.apiconcierge.validation.vehicle.entry.IVehicleEntryValidation;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VehicleEntrySalespersonTest {
    @Mock ISalespersonRepository salespeople;
    @Mock IVehicleEntryRepository repository;
    @Mock IVehicleEntryValidation validation;
    @InjectMocks VehicleEntryService service;

    private VehicleEntry vehicle() {
        var vehicle = new VehicleEntry();
        vehicle.setCompanyId(1); vehicle.setResaleId(2); vehicle.setSalespersonId(17);
        vehicle.setSalespersonName("Client supplied name");
        return vehicle;
    }

    @Test void savesCanonicalSalespersonNameFromTheSameTenantBeforeValidation() {
        var vehicle = vehicle();
        var salesperson = new Salesperson(); salesperson.setId(17); salesperson.setUserId(9);
        salesperson.setName("Vendedor"); salesperson.setStatus(StatusEnableDisable.Habilitado);
        when(salespeople.findByCompanyIdAndResaleIdAndId(1,2,17)).thenReturn(salesperson);
        var response = new MessageResponse(); response.setStatus("ERROR");
        when(validation.save(vehicle,"user")).thenReturn(response);
        assertSame(response, service.save(vehicle,"user"));
        assertEquals(17,vehicle.getSalespersonId());
        assertEquals("Vendedor",vehicle.getSalespersonName());
        verifyNoInteractions(repository);
    }

    @Test void refusesSalespersonFromAnotherTenantBeforeSaving() {
        assertThrows(VehicleEntryException.class, () -> service.save(vehicle(),"user"));
        verifyNoInteractions(repository, validation);
    }

    @Test void refusesDisabledSalespersonWhenUpdating() {
        var salesperson = new Salesperson(); salesperson.setStatus(StatusEnableDisable.Desabilitado);
        when(salespeople.findByCompanyIdAndResaleIdAndId(1,2,17)).thenReturn(salesperson);
        assertThrows(VehicleEntryException.class, () -> service.update(vehicle(),"user"));
        verifyNoInteractions(repository, validation);
    }

    @Test void clearsStaleNameWhenNoSalespersonIsSelected() {
        var vehicle = vehicle(); vehicle.setSalespersonId(null);
        var response = new MessageResponse(); response.setStatus("ERROR");
        when(validation.save(vehicle,"user")).thenReturn(response);
        service.save(vehicle,"user");
        assertNull(vehicle.getSalespersonName());
        verifyNoInteractions(salespeople, repository);
    }
}