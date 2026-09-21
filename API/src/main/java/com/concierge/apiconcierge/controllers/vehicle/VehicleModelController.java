package com.concierge.apiconcierge.controllers.vehicle;

import com.concierge.apiconcierge.dtos.message.MessageResponseDto;
import com.concierge.apiconcierge.dtos.vehicle.model.VehicleModelDto;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.vehicle.model.VehicleModel;
import com.concierge.apiconcierge.services.vehicle.model.VehicleModelService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/vehicle/model")
public class VehicleModelController {

    @Autowired
    VehicleModelService service;

    @PostMapping("/save")
    public ResponseEntity<Object> save(@RequestBody VehicleModelDto data) {
        try {
            VehicleModel model = new VehicleModel();
            BeanUtils.copyProperties(data, model);
            MessageResponse response = this.service.save(model);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @PostMapping("/update")
    public ResponseEntity<Object> update(@RequestBody VehicleModelDto data) {
        try {
            VehicleModel model = new VehicleModel();
            BeanUtils.copyProperties(data, model);
            MessageResponse response = this.service.update(model);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/all")
    public ResponseEntity<Object> listAll(@PathVariable(name = "companyId") Integer companyId,
                                          @PathVariable(name = "resaleId") Integer resaleId) {
        try {
            List<VehicleModel> list = this.service.listAll(companyId, resaleId);
            return ResponseEntity.status(HttpStatus.OK).body(list);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/all/enabled")
    public ResponseEntity<Object> listAllEnabled(@PathVariable(name = "companyId") Integer companyId,
                                                 @PathVariable(name = "resaleId") Integer resaleId) {
        try {
            List<VehicleModel> list = this.service.listAllEnabled(companyId, resaleId);
            return ResponseEntity.status(HttpStatus.OK).body(list);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

}
