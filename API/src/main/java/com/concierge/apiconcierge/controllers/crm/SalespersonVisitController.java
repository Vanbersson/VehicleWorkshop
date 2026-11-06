package com.concierge.apiconcierge.controllers.crm;

import com.concierge.apiconcierge.dtos.crm.agenda.SalespersonVisitAgendaDayDto;
import com.concierge.apiconcierge.dtos.crm.agenda.SalespersonVisitAgendaNewDto;
import com.concierge.apiconcierge.dtos.crm.agenda.SalespersonVisitAgendaResponseDto;
import com.concierge.apiconcierge.dtos.crm.agenda.SalespersonVisitAgendaUpdateDto;
import com.concierge.apiconcierge.dtos.crm.visit.SalespersonVisitRegisterNewDto;
import com.concierge.apiconcierge.dtos.crm.visit.SalespersonVisitRegisterUpdateDto;
import com.concierge.apiconcierge.dtos.crm.visit.SalespersonVisitResponseDto;
import com.concierge.apiconcierge.models.crm.visit.SalespersonVisit;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.services.auth.TokenService;
import com.concierge.apiconcierge.services.crm.visit.ISalespersonVisitService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("salesperson/visit")
public class SalespersonVisitController {
    @Autowired
    private TokenService tokenService;

    @Autowired
    private ISalespersonVisitService service;

    @GetMapping("/agenda/salespersons")
    public List<com.concierge.apiconcierge.dtos.crm.visit.VisitSalespersonOptionDto> agendaSalespersons(HttpServletRequest request) {
        return service.creationSalespersons(true, getEmail(request));
    }

    @GetMapping("/register/salespersons")
    public List<com.concierge.apiconcierge.dtos.crm.visit.VisitSalespersonOptionDto> registerSalespersons(HttpServletRequest request) {
        return service.creationSalespersons(false, getEmail(request));
    }

    @PostMapping("/register/new")
    public ResponseEntity<SalespersonVisit> registerNew(@Valid @RequestBody SalespersonVisitRegisterNewDto data, HttpServletRequest request) {
        String emailUser = this.getEmail(request);
        SalespersonVisit visit = new SalespersonVisit();
        BeanUtils.copyProperties(data, visit);
        SalespersonVisit response = this.service.registerNew(visit, emailUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/register/update")
    public ResponseEntity<SalespersonVisit> registerUpdate(@Valid @RequestBody SalespersonVisitRegisterUpdateDto data, HttpServletRequest request) {
        String emailUser = this.getEmail(request);
        SalespersonVisit visit = new SalespersonVisit();
        BeanUtils.copyProperties(data, visit);
        SalespersonVisit response = this.service.registerUpdate(visit, emailUser);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @PostMapping("/register/{id}/attendance")
    public com.concierge.apiconcierge.dtos.crm.attendance.AttendanceResponseDto generateAttendance(@PathVariable Integer id, HttpServletRequest request) {
        return service.generateAttendance(id, getEmail(request));
    }

    @GetMapping("/id/{id}")
    public ResponseEntity<SalespersonVisit> filterVisit(@PathVariable(name = "id") Integer id, HttpServletRequest request) {
        String emailUser = this.getEmail(request);
        SalespersonVisit response = this.service.filterVisit(id, emailUser);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @PostMapping("/agenda/new")
    public ResponseEntity<MessageResponse> agendaNew(@Valid @RequestBody SalespersonVisitAgendaNewDto data, HttpServletRequest request) {
        String emailUser = this.getEmail(request);
        MessageResponse response = this.service.agendaNew(data, emailUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/agenda/update")
    public ResponseEntity<MessageResponse> agendaUpdate(@Valid @RequestBody SalespersonVisitAgendaUpdateDto data, HttpServletRequest request) {
        String emailUser = this.getEmail(request);
        MessageResponse response = this.service.agendaUpdate(data, emailUser);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @GetMapping("/all")
    public ResponseEntity<List<SalespersonVisitResponseDto>> listAll(HttpServletRequest request) {
        String emailUser = this.getEmail(request);
        List<SalespersonVisitResponseDto> response = this.service.listAll(emailUser);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @PostMapping("/agenda/day")
    public ResponseEntity<List<SalespersonVisitAgendaResponseDto>> listAllAgenda(@RequestBody SalespersonVisitAgendaDayDto data, HttpServletRequest request) {
        String emailUser = this.getEmail(request);
        List<SalespersonVisitAgendaResponseDto> response = this.service.listAllAgenda(data.day(), emailUser);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    @GetMapping("/agenda/overdue")
    public ResponseEntity<List<SalespersonVisitAgendaResponseDto>> listOverdueAgenda(HttpServletRequest request) {
        return ResponseEntity.ok(this.service.listOverdueAgenda(this.getEmail(request)));
    }

    private String getEmail(HttpServletRequest request) {
        String token = request.getHeader("Authorization").replace("Bearer ", "");
        return this.tokenService.validToken(token);
    }
}
