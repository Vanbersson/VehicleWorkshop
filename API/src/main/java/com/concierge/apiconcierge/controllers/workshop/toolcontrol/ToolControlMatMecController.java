package com.concierge.apiconcierge.controllers.workshop.toolcontrol;

import com.concierge.apiconcierge.dtos.message.MessageResponseDto;
import com.concierge.apiconcierge.dtos.workshop.toolcontrol.ToolControlMatMecDto;
import com.concierge.apiconcierge.models.workshop.toolcontrol.ToolControlMatMec;
import com.concierge.apiconcierge.services.workshop.matmec.IToolControlMatMecService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/workshop/tool/control/matmec")
public class ToolControlMatMecController {

    @Autowired
   private IToolControlMatMecService service;

    @PostMapping("/save")
    public ResponseEntity<Object> saveMaterial(@RequestBody ToolControlMatMecDto data) {
        try {
            ToolControlMatMec matMec = new ToolControlMatMec();
            BeanUtils.copyProperties(data, matMec);
            String message = this.service.saveMaterial(matMec);
            return ResponseEntity.status(HttpStatus.CREATED).body(new MessageResponseDto(message));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @PostMapping("/return")
    public ResponseEntity<Object> returnMaterial(@RequestBody ToolControlMatMecDto data) {
        try {
            ToolControlMatMec matMec = new ToolControlMatMec();
            BeanUtils.copyProperties(data, matMec);
            String message = this.service.returnMaterial(matMec);
            return ResponseEntity.status(HttpStatus.OK).body(new MessageResponseDto(message));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/filter/id/{id}")
    public ResponseEntity<Object> filterId(@PathVariable(name = "companyId") Integer companyId,
                                           @PathVariable(name = "resaleId") Integer resaleId,
                                           @PathVariable(name = "id") UUID id) {
        try {
            ToolControlMatMec result = this.service.filterId(companyId, resaleId, id);
            return ResponseEntity.status(HttpStatus.OK).body(result);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/filter/request/{request}")
    public ResponseEntity<Object> filterRequestId(@PathVariable(name = "companyId") Integer companyId,
                                                  @PathVariable(name = "resaleId") Integer resaleId,
                                                  @PathVariable(name = "request") Integer requestId) {
        try {
            List<ToolControlMatMec> result = this.service.filterRequestId(companyId, resaleId, requestId);
            return ResponseEntity.status(HttpStatus.OK).body(result);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

}
