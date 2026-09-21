package com.concierge.apiconcierge.controllers.workshop.mechanic;

import com.concierge.apiconcierge.dtos.message.MessageResponseDto;
import com.concierge.apiconcierge.dtos.workshop.mechanic.MechanicDto;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.workshop.mechanic.Mechanic;
import com.concierge.apiconcierge.services.workshop.mechanic.IMechanicService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/workshop/reg/mechanic")
public class MechanicController {

    @Autowired
    private IMechanicService service;

    @PostMapping("/save")
    public ResponseEntity<Object> save(@RequestBody MechanicDto data) {
        try {
            Mechanic mec = new Mechanic();
            BeanUtils.copyProperties(data, mec);
            MessageResponse response = this.service.save(mec);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @PostMapping("/update")
    public ResponseEntity<Object> update(@RequestBody MechanicDto data) {
        try {
            Mechanic mec = new Mechanic();
            BeanUtils.copyProperties(data, mec);
            MessageResponse response = this.service.update(mec);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/all")
    public ResponseEntity<Object> listAll(@PathVariable(name = "companyId") Integer companyId,
                                          @PathVariable(name = "resaleId") Integer resaleId) {
        try {
            List<Mechanic> result = this.service.listAll(companyId, resaleId);
            return ResponseEntity.status(HttpStatus.OK).body(result);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/all/enabled")
    public ResponseEntity<Object> listAllEnabled(@PathVariable(name = "companyId") Integer companyId,
                                                 @PathVariable(name = "resaleId") Integer resaleId) {
        try {
            List<Mechanic> result = this.service.listAllEnabled(companyId, resaleId);
            return ResponseEntity.status(HttpStatus.OK).body(result);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/filter/{id}")
    public ResponseEntity<Object> filterId(@PathVariable(name = "companyId") Integer companyId,
                                           @PathVariable(name = "resaleId") Integer resaleId,
                                           @PathVariable(name = "id") Integer id) {
        try {
            MessageResponse response = this.service.filterId(companyId, resaleId,id);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @PostMapping("/save/photo")
    public ResponseEntity<Object> savePhoto(@RequestParam("file") MultipartFile file,
                                                  @RequestParam("local") String local) {
        try {
            MessageResponse response = this.service.savePhoto(file, local);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @PostMapping("/delete/photo")
    public ResponseEntity<Object> deletePhoto(@RequestParam("local") String local) {
        try {
            MessageResponse response = this.service.deletePhoto(local);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

}
