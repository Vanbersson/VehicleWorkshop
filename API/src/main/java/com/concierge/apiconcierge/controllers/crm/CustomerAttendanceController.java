package com.concierge.apiconcierge.controllers.crm;

import com.concierge.apiconcierge.dtos.crm.attendance.AttendanceResponseDto;
import com.concierge.apiconcierge.dtos.crm.attendance.AttendanceUpdateDto;
import com.concierge.apiconcierge.services.auth.TokenService;
import com.concierge.apiconcierge.services.crm.attendance.CustomerAttendanceService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("crm/customer-attendance")
public class CustomerAttendanceController {
    @Autowired private TokenService tokenService;
    @Autowired private CustomerAttendanceService service;

    @PostMapping
    public AttendanceResponseDto create(@Valid @RequestBody com.concierge.apiconcierge.dtos.crm.attendance.AttendanceCreateDto data, HttpServletRequest request) {
        return service.create(data, email(request));
    }

    @GetMapping
    public List<AttendanceResponseDto> list(HttpServletRequest request) { return service.list(email(request)); }

    @GetMapping("/creation-salespersons")
    public List<com.concierge.apiconcierge.dtos.salesperson.ResponseSalespersonDto> creationSalespersons(HttpServletRequest request) {
        return service.creationSalespersons(email(request));
    }

    @GetMapping("/{id}")
    public com.concierge.apiconcierge.dtos.crm.attendance.AttendanceDetailDto detail(@PathVariable Integer id, HttpServletRequest request) {
        return service.detail(id, email(request));
    }

    @PostMapping("/active/search")
    public List<AttendanceResponseDto> searchActive(@Valid @RequestBody com.concierge.apiconcierge.dtos.crm.attendance.AttendanceSearchDto data, HttpServletRequest request) {
        return service.search(data, false, email(request));
    }

    @PostMapping("/cancelled/search")
    public List<AttendanceResponseDto> searchCancelled(@Valid @RequestBody com.concierge.apiconcierge.dtos.crm.attendance.AttendanceSearchDto data, HttpServletRequest request) {
        return service.search(data, true, email(request));
    }

    @PostMapping("/update")
    public AttendanceResponseDto update(@Valid @RequestBody AttendanceUpdateDto data, HttpServletRequest request) {
        return service.update(data, email(request));
    }

    @PostMapping("/cancel")
    public AttendanceResponseDto cancel(@Valid @RequestBody com.concierge.apiconcierge.dtos.crm.attendance.AttendanceCancelDto data, HttpServletRequest request) {
        return service.cancel(data, email(request));
    }

    private String email(HttpServletRequest request) { return tokenService.validToken(request.getHeader("Authorization").replace("Bearer ", "")); }
}
