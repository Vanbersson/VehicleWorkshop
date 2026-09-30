package com.concierge.apiconcierge.services.vehicle.entry;

import com.concierge.apiconcierge.dtos.vehicle.entry.AuthExitDto;
import com.concierge.apiconcierge.dtos.vehicle.entry.ExistsVehiclePlateDto;
import com.concierge.apiconcierge.dtos.vehicle.entry.VehicleExitDto;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.vehicle.checklist.VehicleEntryChecklist;
import com.concierge.apiconcierge.models.vehicle.entry.VehicleEntry;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface IVehicleEntryService {

    MessageResponse save(VehicleEntry vehicle, String userEmail);

    MessageResponse update(VehicleEntry vehicle, String userEmail);

    MessageResponse exit(VehicleExitDto dataExit, String userEmail);

    List<Map<String, Object>> listAllAuthorized(Integer companyId, Integer resaleId);

    List<Map<String, Object>> listAll(Integer companyId, Integer resaleId);

    MessageResponse filterId(Integer companyId, Integer resaleId, Integer id);

    MessageResponse saveChecklist(VehicleEntryChecklist ch, String userEmail);

    MessageResponse updateChecklist(VehicleEntryChecklist ch);

    MessageResponse filterChecklist(Integer companyId, Integer resaleId, Integer id);

    MessageResponse filterPlate(Integer companyId, Integer resaleId, String plate);

    MessageResponse filterFreeAdmission(Integer companyId, Integer resaleId, String plate);

    MessageResponse filterTogether(Integer companyId, Integer resaleId, String together);

    MessageResponse addAuthExit(AuthExitDto authExitDto, String userEmail);

    MessageResponse deleteAuthExit1(AuthExitDto authExitDto, String userEmail);

    MessageResponse deleteAuthExit2(AuthExitDto authExitDto, String userEmail);

    MessageResponse saveImage(MultipartFile file, String local);

    MessageResponse deleteImage(String local);

}
