package com.concierge.apiconcierge.controllers.parts.unit;

import com.concierge.apiconcierge.dtos.message.MessageResponseDto;
import com.concierge.apiconcierge.dtos.parts.unit.UnitMeasureDto;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.part.unit.UnitMeasure;
import com.concierge.apiconcierge.services.parts.unit.IUnitMeasureService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/unit/measure")
public class UnitMeasureController {
    @Autowired
    private IUnitMeasureService service;

    @PostMapping("/save")
    public ResponseEntity<Object> save(@RequestBody UnitMeasureDto data) {
        try {
            UnitMeasure un = new UnitMeasure();
            BeanUtils.copyProperties(data, un);
            MessageResponse response = this.service.save(un);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @PostMapping("/update")
    public ResponseEntity<Object> update(@RequestBody UnitMeasureDto data) {
        try {
            UnitMeasure un = new UnitMeasure();
            BeanUtils.copyProperties(data, un);
            MessageResponse response = this.service.update(un);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/list/all")
    public ResponseEntity<Object> listAll() {
        try {
            List<UnitMeasure> response = this.service.listAll();
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }
    @GetMapping("/list/all/enabled")
    public ResponseEntity<Object> listAllEnabled() {
        try {
            List<UnitMeasure> response = this.service.listAllEnabled();
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }
}
