package com.concierge.apiconcierge.validation.vehicle.entry;

import com.concierge.apiconcierge.dtos.vehicle.entry.AuthExitDto;
import com.concierge.apiconcierge.dtos.vehicle.entry.ExistsVehiclePlateDto;
import com.concierge.apiconcierge.dtos.vehicle.entry.VehicleExitDto;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.vehicle.entry.VehicleEntry;

public interface IVehicleEntryValidation {
    public MessageResponse save(VehicleEntry vehicle, String userEmail);

    public MessageResponse update(VehicleEntry vehicle, String userEmail);

    public MessageResponse exit(VehicleExitDto dataExit, String userEmail);

    public String listAllAuthorized(Integer companyId, Integer resaleId);

    public String listAll(Integer companyId, Integer resaleId);

    public MessageResponse filterId(Integer companyId, Integer resaleId, Integer id);

    public MessageResponse filterPlate(Integer companyId, Integer resaleId,String plate);

    public MessageResponse addAuthExit(VehicleEntry vehicle, AuthExitDto authExitDto, String userEmail);

    public MessageResponse deleteAuthExit1(VehicleEntry vehicle, AuthExitDto authExitDto, String userEmail);

    public MessageResponse deleteAuthExit2(VehicleEntry vehicle, AuthExitDto authExitDto, String userEmail);


}
