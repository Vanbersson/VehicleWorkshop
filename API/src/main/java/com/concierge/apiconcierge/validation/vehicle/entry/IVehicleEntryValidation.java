package com.concierge.apiconcierge.validation.vehicle.entry;

import com.concierge.apiconcierge.dtos.vehicleEntry.AuthExitDto;
import com.concierge.apiconcierge.dtos.vehicle.entry.VehicleExitDto;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.user.User;
import com.concierge.apiconcierge.models.vehicle.entry.VehicleEntry;

public interface IVehicleEntryValidation {
     MessageResponse save(VehicleEntry vehicle, String userEmail);

     MessageResponse update(VehicleEntry vehicle, String userEmail);

     MessageResponse exit(VehicleExitDto dataExit, String userEmail);

     String listAllAuthorized(Integer companyId, Integer resaleId);

     String listAll(Integer companyId, Integer resaleId);

     MessageResponse filterId(Integer companyId, Integer resaleId, Integer id);

     MessageResponse filterPlate(Integer companyId, Integer resaleId, String plate);

     MessageResponse addAuthExit(VehicleEntry vehicle, User user);

     MessageResponse deleteAuthExit1(VehicleEntry vehicle, User user);

     MessageResponse deleteAuthExit2(VehicleEntry vehicle, User user);


}
