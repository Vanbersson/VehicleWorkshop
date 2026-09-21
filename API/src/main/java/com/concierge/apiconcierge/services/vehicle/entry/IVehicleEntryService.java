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

    public MessageResponse save(VehicleEntry vehicle, String userEmail);

    public MessageResponse update(VehicleEntry vehicle, String userEmail);

    public MessageResponse exit(VehicleExitDto dataExit, String userEmail);

    public List<Map<String, Object>> listAllAuthorized(Integer companyId, Integer resaleId);

    public List<Map<String, Object>> listAll(Integer companyId, Integer resaleId);

    public MessageResponse filterId(Integer companyId, Integer resaleId, Integer id);

    public MessageResponse saveChecklist(VehicleEntryChecklist ch, String userEmail);

    public MessageResponse updateChecklist(VehicleEntryChecklist ch);

    public MessageResponse filterChecklist(Integer companyId, Integer resaleId, Integer id);

    public MessageResponse filterPlate(Integer companyId, Integer resaleId, String plate);

    public MessageResponse filterTogether(Integer companyId, Integer resaleId, String together);

    public MessageResponse addAuthExit(AuthExitDto authExitDto, String userEmail);

    public MessageResponse deleteAuthExit1(AuthExitDto authExitDto, String userEmail);

    public MessageResponse deleteAuthExit2(AuthExitDto authExitDto, String userEmail);

    public MessageResponse saveImage(MultipartFile file, String local);
    public MessageResponse deleteImage(String local);

}
