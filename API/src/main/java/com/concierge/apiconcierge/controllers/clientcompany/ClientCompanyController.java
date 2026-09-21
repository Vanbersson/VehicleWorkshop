package com.concierge.apiconcierge.controllers.clientcompany;

import com.concierge.apiconcierge.dtos.message.MessageResponseDto;
import com.concierge.apiconcierge.dtos.clientcompany.ClientCompanyDto;
import com.concierge.apiconcierge.models.clientcompany.ClientCompany;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.services.clientcompany.IClientCompanyService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/clientcompany")
public class ClientCompanyController {

    @Autowired
    private IClientCompanyService service;

    @PostMapping("/save")
    public ResponseEntity<Object> save(@RequestBody ClientCompanyDto data) {
        try {
            ClientCompany clientCompany = new ClientCompany();
            BeanUtils.copyProperties(data, clientCompany);
            MessageResponse response = this.service.save(clientCompany);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @PostMapping("/update")
    public ResponseEntity<Object> update(@RequestBody ClientCompanyDto data) {
        try {
            ClientCompany clientCompany = new ClientCompany();
            BeanUtils.copyProperties(data, clientCompany);
            MessageResponse response = this.service.update(clientCompany);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/filter/all")
    public ResponseEntity<Object> all(@PathVariable(name = "companyId") Integer companyId,
                                      @PathVariable(name = "resaleId") Integer resaleId) {
        try {
            MessageResponse response = this.service.listAll(companyId, resaleId);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/filter/id/{id}")
    public ResponseEntity<Object> filterId(@PathVariable(name = "companyId") Integer companyId,
                                           @PathVariable(name = "resaleId") Integer resaleId,
                                           @PathVariable(name = "id") Integer clientId) {
        try {
            MessageResponse response = this.service.filterId(companyId, resaleId, clientId);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/filter/j/fantasia/{fantasia}")
    public ResponseEntity<Object> getJFantasia(@PathVariable(name = "companyId") Integer companyId,
                                               @PathVariable(name = "resaleId") Integer resaleId,
                                               @PathVariable(name = "fantasia") String fantasia) {
        try {
            MessageResponse response = this.service.filterJFantasia(companyId, resaleId, fantasia);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/filter/f/fantasia/{fantasia}")
    public ResponseEntity<Object> getFFantasia(@PathVariable(name = "companyId") Integer companyId,
                                               @PathVariable(name = "resaleId") Integer resaleId,
                                               @PathVariable(name = "fantasia") String fantasia) {
        try {
            MessageResponse response = this.service.filterFFantasia(companyId, resaleId, fantasia);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/filter/j/name/{name}")
    public ResponseEntity<Object> getJName(@PathVariable(name = "companyId") Integer companyId,
                                           @PathVariable(name = "resaleId") Integer resaleId,
                                           @PathVariable(name = "name") String name) {
        try {
            MessageResponse response = this.service.filterJNome(companyId, resaleId, name);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }

    }

    @GetMapping("/{companyId}/{resaleId}/filter/f/name/{name}")
    public ResponseEntity<Object> getFName(@PathVariable(name = "companyId") Integer companyId,
                                           @PathVariable(name = "resaleId") Integer resaleId,
                                           @PathVariable(name = "name") String name) {
        try {
            MessageResponse response = this.service.filterFNome(companyId, resaleId, name);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }

    }

    @GetMapping("/{companyId}/{resaleId}/filter/cnpj/{cnpj}")
    public ResponseEntity<Object> getCnpj(@PathVariable(name = "companyId") Integer companyId,
                                          @PathVariable(name = "resaleId") Integer resaleId,
                                          @PathVariable(name = "cnpj") String cnpj) {
        try {
            MessageResponse response = this.service.filterCNPJ(companyId, resaleId, cnpj);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/filter/cpf/{cpf}")
    public ResponseEntity<Object> getCpf(@PathVariable(name = "companyId") Integer companyId,
                                         @PathVariable(name = "resaleId") Integer resaleId,
                                         @PathVariable(name = "cpf") String cpf) {
        try {
            MessageResponse response = this.service.filterCPF(companyId, resaleId, cpf);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

}
