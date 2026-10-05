package com.concierge.apiconcierge.controllers.salesperson;

import com.concierge.apiconcierge.dtos.brand.BrandDto;
import com.concierge.apiconcierge.dtos.message.MessageResponseDto;
import com.concierge.apiconcierge.dtos.salesperson.SalespersonGroupDto;
import com.concierge.apiconcierge.models.brand.Brand;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.salesperson.SalespersonGroup;
import com.concierge.apiconcierge.services.auth.TokenService;
import com.concierge.apiconcierge.services.salesperson.group.ISalespersonGroupService;
import jakarta.servlet.http.HttpServletRequest;
import org.apache.catalina.LifecycleState;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/salesperson/group")
public class SalespersonGroupController {
    @Autowired
    private TokenService tokenService;
    @Autowired
    private ISalespersonGroupService service;

    @PostMapping("/save")
    public ResponseEntity<Object> save(@RequestBody SalespersonGroupDto data, HttpServletRequest request) {
        try {
            String emailUser = this.getEmail(request);
            SalespersonGroup g = new SalespersonGroup();
            BeanUtils.copyProperties(data, g);
            MessageResponse response = this.service.save(g, emailUser);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @PostMapping("/update")
    public ResponseEntity<Object> update(@RequestBody SalespersonGroupDto data) {
        try {
            SalespersonGroup g = new SalespersonGroup();
            BeanUtils.copyProperties(data, g);
            MessageResponse response = this.service.update(g);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/all")
    public ResponseEntity<Object> all(HttpServletRequest request) {
        try {
            String emailUser = this.getEmail(request);
            List<SalespersonGroup> response = this.service.listAll(emailUser);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/all/enabled")
    public ResponseEntity<Object> allEnabled(HttpServletRequest request) {
        try {
            String emailUser = this.getEmail(request);
            List<SalespersonGroup> response = this.service.listAllEnabled(emailUser);
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
