package com.concierge.apiconcierge.controllers.vehicle;

import com.concierge.apiconcierge.dtos.message.MessageResponseDto;
import com.concierge.apiconcierge.dtos.vehicle.checklist.VehicleEntryChecklistDto;
import com.concierge.apiconcierge.dtos.vehicle.entry.AuthExitDto;
import com.concierge.apiconcierge.dtos.vehicle.entry.ExistsVehiclePlateDto;
import com.concierge.apiconcierge.dtos.vehicle.entry.VehicleEntryDto;
import com.concierge.apiconcierge.dtos.vehicle.entry.VehicleExitDto;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.vehicle.checklist.VehicleEntryChecklist;
import com.concierge.apiconcierge.models.vehicle.entry.VehicleEntry;
import com.concierge.apiconcierge.services.auth.TokenService;
import com.concierge.apiconcierge.services.vehicle.entry.IVehicleEntryService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/vehicle/entry")
public class VehicleEntryController {

    @Autowired
    private IVehicleEntryService service;
    @Autowired
    private TokenService tokenService;

    @PostMapping("/save")
    public ResponseEntity<Object> save(@RequestBody VehicleEntryDto data, HttpServletRequest request) {
        try {
            String userEmail = this.getEmail(request);
            VehicleEntry vehicleEntry = new VehicleEntry();
            BeanUtils.copyProperties(data, vehicleEntry);
            MessageResponse response = this.service.save(vehicleEntry, userEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @PostMapping("/update")
    public ResponseEntity<Object> update(@RequestBody VehicleEntryDto data, HttpServletRequest request) {
        try {
            String userEmail = this.getEmail(request);
            VehicleEntry vehicleEntry = new VehicleEntry();
            BeanUtils.copyProperties(data, vehicleEntry);
            MessageResponse response = this.service.update(vehicleEntry, userEmail);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @PostMapping("/exit")
    public ResponseEntity<Object> exit(@RequestBody VehicleExitDto data, HttpServletRequest request) {
        try {
            String userEmail = this.getEmail(request);
            MessageResponse response = this.service.exit(data, userEmail);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/all/authorized")
    public ResponseEntity<Object> listAllAuthorized(@PathVariable(name = "companyId") Integer companyId,
                                                    @PathVariable(name = "resaleId") Integer resaleId) {
        try {
            return ResponseEntity.ok(this.service.listAllAuthorized(companyId, resaleId));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/all")
    public ResponseEntity<Object> listAll(@PathVariable(name = "companyId") Integer companyId,
                                          @PathVariable(name = "resaleId") Integer resaleId) {
        try {
            return ResponseEntity.ok(this.service.listAll(companyId, resaleId));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/filter/id/{id}")
    public ResponseEntity<Object> filterId(@PathVariable(name = "companyId") Integer companyId,
                                           @PathVariable(name = "resaleId") Integer resaleId,
                                           @PathVariable(name = "id") Integer id) {
        try {
            MessageResponse response = this.service.filterId(companyId, resaleId, id);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @PostMapping("/save/checklist")
    public ResponseEntity<Object> saveChecklist(@RequestBody VehicleEntryChecklistDto data, HttpServletRequest request) {
        try {
            String userEmail = this.getEmail(request);
            VehicleEntryChecklist ch = new VehicleEntryChecklist();
            BeanUtils.copyProperties(data, ch);
            MessageResponse response = this.service.saveChecklist(ch, userEmail);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @PostMapping("/update/checklist")
    public ResponseEntity<Object> updateChecklist(@RequestBody VehicleEntryChecklistDto data) {
        try {
            VehicleEntryChecklist ch = new VehicleEntryChecklist();
            BeanUtils.copyProperties(data, ch);
            MessageResponse response = this.service.updateChecklist(ch);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/filter/checklist/{id}")
    public ResponseEntity<Object> filterChecklist(@PathVariable(name = "companyId") Integer companyId,
                                                  @PathVariable(name = "resaleId") Integer resaleId,
                                                  @PathVariable(name = "id") Integer id) {
        try {
            MessageResponse response = this.service.filterChecklist(companyId, resaleId, id);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/filter/plate/{plate}")
    public ResponseEntity<Object> filterPlate(@PathVariable(name = "companyId") Integer companyId,
                                              @PathVariable(name = "resaleId") Integer resaleId,
                                              @PathVariable(name = "plate") String plate) {
        try {
            MessageResponse response = this.service.filterPlate(companyId, resaleId, plate);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/filter/together/{together}")
    public ResponseEntity<Object> filterTogether(@PathVariable(name = "companyId") Integer companyId,
                                                 @PathVariable(name = "resaleId") Integer resaleId,
                                                 @PathVariable(name = "together") String together) {
        try {
            MessageResponse response = this.service.filterTogether(companyId, resaleId, together);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @PostMapping("/authorization/add")
    public ResponseEntity<Object> addAuthorizationExit(@RequestBody AuthExitDto auth, HttpServletRequest request) {
        try {
            String userEmail = this.getEmail(request);
            MessageResponse response = this.service.addAuthExit(auth, userEmail);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @PostMapping("/authorization/delete1")
    public ResponseEntity<Object> deleteAuthorizationExit1(@RequestBody AuthExitDto auth, HttpServletRequest request) {
        try {
            String userEmail = this.getEmail(request);
            MessageResponse response = this.service.deleteAuthExit1(auth, userEmail);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @PostMapping("/authorization/delete2")
    public ResponseEntity<Object> deleteAuthorizationExit2(@RequestBody AuthExitDto auth, HttpServletRequest request) {
        try {
            String userEmail = this.getEmail(request);
            MessageResponse response = this.service.deleteAuthExit2(auth, userEmail);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @PostMapping("/save/image")
    public ResponseEntity<Object> saveImage(@RequestParam("file") MultipartFile file,
                                            @RequestParam("local") String local) {
        try {
            MessageResponse response = this.service.saveImage(file, local);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @PostMapping("/delete/image")
    public ResponseEntity<Object> deleteImage(@RequestParam("local") String local) {
        try {
            MessageResponse response = this.service.deleteImage(local);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }


    private String getEmail(HttpServletRequest request) {
        String token = request.getHeader("Authorization").replace("Bearer ", "");
        return this.tokenService.validToken(token);
    }

}
