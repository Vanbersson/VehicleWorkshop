package com.concierge.apiconcierge.controllers.module;

import com.concierge.apiconcierge.dtos.message.MessageResponseDto;
import com.concierge.apiconcierge.dtos.module.ConfVehicleEntryChecklistDto;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.module.ConfVehicleEntryChecklist;
import com.concierge.apiconcierge.services.module.IConfVehicleEntryChecklistService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/module/concierge/vehicle/entry/checklist")
public class ConfVehicleEntryChecklistController {

    @Autowired
    private IConfVehicleEntryChecklistService service;


    @PostMapping("/update")
    public ResponseEntity<Object> update(@RequestBody ConfVehicleEntryChecklistDto data) {
        try {
            ConfVehicleEntryChecklist mod = new ConfVehicleEntryChecklist();
            BeanUtils.copyProperties(data, mod);
            MessageResponse response = this.service.update(mod);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/checklist")
    public ResponseEntity<Object> filterId(@PathVariable(name = "companyId") Integer companyId,
                                          @PathVariable(name = "resaleId") Integer resaleId) {
        try {
            MessageResponse response = this.service.filterCompanyResale(companyId, resaleId);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

}
