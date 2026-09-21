package com.concierge.apiconcierge.controllers.clientcompany;

import com.concierge.apiconcierge.dtos.clientcompany.ClientCategoryDto;
import com.concierge.apiconcierge.dtos.message.MessageResponseDto;
import com.concierge.apiconcierge.models.clientcompany.ClientCategory;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.services.clientcompany.category.IClientCategoryService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/clientcompany/category")
public class ClientCategoryController {

    @Autowired
    private IClientCategoryService service;

    @PostMapping("/save")
    public ResponseEntity<Object> save(@RequestBody ClientCategoryDto data) {
        try {
            ClientCategory category = new ClientCategory();
            BeanUtils.copyProperties(data, category);
            MessageResponse response = this.service.save(category);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @PostMapping("/update")
    public ResponseEntity<Object> update(@RequestBody ClientCategoryDto data) {
        try {
            ClientCategory category = new ClientCategory();
            BeanUtils.copyProperties(data, category);
            MessageResponse response = this.service.update(category);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/filter/all")
    public ResponseEntity<Object> listAll(
            @PathVariable(name = "companyId") Integer companyId,
            @PathVariable(name = "resaleId") Integer resaleId) {
        try {
            MessageResponse response = this.service.listAll(companyId, resaleId);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/filter/all/enabled")
    public ResponseEntity<Object> listAllEnabled(
            @PathVariable(name = "companyId") Integer companyId,
            @PathVariable(name = "resaleId") Integer resaleId) {
        try {
            MessageResponse response = this.service.listAllStatus(companyId, resaleId, StatusEnableDisable.Habilitado);
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
            MessageResponse response = this.service.filterId(companyId, resaleId,id);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

}
