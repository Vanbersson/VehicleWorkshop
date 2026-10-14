package com.concierge.apiconcierge.controllers.salesperson;

import com.concierge.apiconcierge.dtos.message.MessageResponseDto;
import com.concierge.apiconcierge.dtos.salesperson.SalespersonGroupDto;
import com.concierge.apiconcierge.dtos.salesperson.SalespersonNewDto;
import com.concierge.apiconcierge.dtos.salesperson.SalespersonUpdateDto;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.salesperson.Salesperson;
import com.concierge.apiconcierge.models.salesperson.SalespersonGroup;
import com.concierge.apiconcierge.services.auth.TokenService;
import com.concierge.apiconcierge.services.salesperson.person.ISalespersonService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/salesperson")
public class SalespersonController {

    @Autowired
    private TokenService tokenService;

    @Autowired
    private ISalespersonService service;

    @PostMapping("/save")
    public ResponseEntity<MessageResponse> save(@RequestBody SalespersonNewDto data, HttpServletRequest request) {
        String emailUser = this.getEmail(request);
        Salesperson person = new Salesperson();
        BeanUtils.copyProperties(data, person);
        MessageResponse response = this.service.save(person, emailUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/update")
    public ResponseEntity<MessageResponse> update(@RequestBody SalespersonUpdateDto data) {
        Salesperson person = new Salesperson();
        BeanUtils.copyProperties(data, person);
        MessageResponse response = this.service.update(person);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @GetMapping("/all")
    public ResponseEntity<List<Salesperson>> all(HttpServletRequest request) {
        String emailUser = this.getEmail(request);
        List<Salesperson> response = this.service.all(emailUser);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
    @GetMapping("/all/enabled")
    public ResponseEntity<List<Salesperson>> allEnabled(HttpServletRequest request) {
        String emailUser = this.getEmail(request);
        List<Salesperson> response = this.service.allEnabled(emailUser);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    private String getEmail(HttpServletRequest request) {
        String token = request.getHeader("Authorization").replace("Bearer ", "");
        return this.tokenService.validToken(token);
    }
}
