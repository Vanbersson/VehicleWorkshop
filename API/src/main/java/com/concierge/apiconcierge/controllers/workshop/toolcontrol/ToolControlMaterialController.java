package com.concierge.apiconcierge.controllers.workshop.toolcontrol;

import com.concierge.apiconcierge.dtos.message.MessageResponseDto;
import com.concierge.apiconcierge.dtos.workshop.toolcontrol.ToolControlMaterialDto;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.workshop.toolcontrol.ToolControlMaterial;
import com.concierge.apiconcierge.services.workshop.toolcontrol.material.ToolControlMaterialService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/workshop/tool/control/material")
public class ToolControlMaterialController {

    @Autowired
    ToolControlMaterialService service;

    @PostMapping("/save")
    public ResponseEntity<Object> save(@RequestBody ToolControlMaterialDto data) {
        try {
            ToolControlMaterial mat = new ToolControlMaterial();
            BeanUtils.copyProperties(data, mat);
            MessageResponse response = this.service.save(mat);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @PostMapping("/update")
    public ResponseEntity<Object> update(@RequestBody ToolControlMaterialDto data) {
        try {
            ToolControlMaterial mat = new ToolControlMaterial();
            BeanUtils.copyProperties(data, mat);
            MessageResponse response = this.service.update(mat);
            return ResponseEntity.status(HttpStatus.OK).body(response);
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

    @GetMapping("/{companyId}/{resaleId}/all")
    public ResponseEntity<Object> listAll(@PathVariable(name = "companyId") Integer companyId,
                                          @PathVariable(name = "resaleId") Integer resaleId) {
        try {
            List<Map<String, Object>> result = this.service.listAll(companyId, resaleId);
            return ResponseEntity.status(HttpStatus.OK).body(result);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/all/enabled")
    public ResponseEntity<Object> listAllEnabled(@PathVariable(name = "companyId") Integer companyId,
                                                 @PathVariable(name = "resaleId") Integer resaleId) {
        try {
            List<Map<String, Object>> result = this.service.listAllEnabled(companyId, resaleId);
            return ResponseEntity.status(HttpStatus.OK).body(result);
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
}
