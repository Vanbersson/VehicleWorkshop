package com.concierge.apiconcierge.controllers.driver;

import com.concierge.apiconcierge.dtos.driver.DriverDto;
import com.concierge.apiconcierge.dtos.message.MessageResponseDto;
import com.concierge.apiconcierge.models.driver.Driver;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.services.driver.IDriverService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/driver")
public class DriverController {

    @Autowired
    private IDriverService service;

    @PostMapping("/save")
    public ResponseEntity<Object> save(@RequestBody DriverDto data) {
        try {
            Driver driver = new Driver();
            BeanUtils.copyProperties(data, driver);
            MessageResponse response = this.service.save(driver);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @PostMapping("/update")
    public ResponseEntity<Object> update(@RequestBody DriverDto data) {
        try {
            Driver driver = new Driver();
            BeanUtils.copyProperties(data, driver);
            MessageResponse response = this.service.update(driver);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/filter/all")
    public ResponseEntity<Object> listAll(@PathVariable(name = "companyId") Integer companyId,
                                          @PathVariable(name = "resaleId") Integer resaleId) {
        try {
            List<Map<String, Object>> response = this.service.listAll(companyId, resaleId);
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
            MessageResponse response = this.service.filterDriverId(companyId, resaleId, id);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/filter/name/{name}")
    public ResponseEntity<Object> filterName(@PathVariable(name = "companyId") Integer companyId,
                                             @PathVariable(name = "resaleId") Integer resaleId,
                                             @PathVariable(name = "name") String name) {
        try {
            MessageResponse response = this.service.filterDriverName(companyId, resaleId, name);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/filter/cpf/{cpf}")
    public ResponseEntity<Object> filterCPF(@PathVariable(name = "companyId") Integer companyId,
                                            @PathVariable(name = "resaleId") Integer resaleId,
                                            @PathVariable(name = "cpf") String cpf) {
        try {
            MessageResponse response = this.service.filterDriverCPF(companyId, resaleId, cpf);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/filter/rg/{rg}")
    public ResponseEntity<Object> filterRG(@PathVariable(name = "companyId") Integer companyId,
                                           @PathVariable(name = "resaleId") Integer resaleId,
                                           @PathVariable(name = "rg") String rg) {
        try {
            MessageResponse response = this.service.filterDriverRG(companyId, resaleId, rg);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/filter/cnh/register/{cnh}")
    public ResponseEntity<Object> filterCNHRegister(@PathVariable(name = "companyId") Integer companyId,
                                                    @PathVariable(name = "resaleId") Integer resaleId,
                                                    @PathVariable(name = "cnh") String cnh) {
        try {
            MessageResponse response = this.service.filterDriverCNHRegister(companyId, resaleId, cnh);
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



}
