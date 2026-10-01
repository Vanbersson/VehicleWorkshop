package com.concierge.apiconcierge.controllers.clientcompany;

import com.concierge.apiconcierge.dtos.clientcompany.ClientCompanyDto;
import com.concierge.apiconcierge.dtos.clientcompany.ClientCompanyRegionDto;
import com.concierge.apiconcierge.dtos.message.MessageResponseDto;
import com.concierge.apiconcierge.models.clientcompany.ClientCompany;
import com.concierge.apiconcierge.models.clientcompany.ClientCompanyRegion;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.services.auth.TokenService;
import com.concierge.apiconcierge.services.clientcompany.region.IClientCompanyRegionService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/clientcompany/region")
public class ClientCompanyRegionController {
    @Autowired
    private TokenService tokenService;

    @Autowired
    private IClientCompanyRegionService service;

    @PostMapping("/save")
    public ResponseEntity<Object> save(@RequestBody ClientCompanyRegionDto data, HttpServletRequest request) {
        try {
            String emailUser = this.getEmail(request);
            ClientCompanyRegion region = new ClientCompanyRegion();
            BeanUtils.copyProperties(data, region);
            MessageResponse response = this.service.save(region, emailUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @PostMapping("/update")
    public ResponseEntity<Object> update(@RequestBody ClientCompanyRegionDto data) {
        try {
            ClientCompanyRegion region = new ClientCompanyRegion();
            BeanUtils.copyProperties(data, region);
            MessageResponse response = this.service.update(region);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<Object> listAll(HttpServletRequest request) {
        try {
            String emailUser = this.getEmail(request);
            List<ClientCompanyRegion> response = this.service.listAll(emailUser);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/all/enabled")
    public ResponseEntity<Object> listAllEnabled(HttpServletRequest request) {
        try {
            String emailUser = this.getEmail(request);
            List<ClientCompanyRegion> response = this.service.listAllEnabled(emailUser);
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
