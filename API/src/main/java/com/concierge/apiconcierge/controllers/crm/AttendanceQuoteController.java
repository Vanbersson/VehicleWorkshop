package com.concierge.apiconcierge.controllers.crm;

import com.concierge.apiconcierge.dtos.crm.attendance.*;
import com.concierge.apiconcierge.services.crm.attendance.AttendanceQuoteService;
import com.concierge.apiconcierge.services.auth.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("crm/customer-attendance/quote")
public class AttendanceQuoteController {
    @Autowired
    private AttendanceQuoteService service;
    @Autowired
    private TokenService tokenService;

    @GetMapping("/{attendanceId}")
    public QuoteResponseDto get(@PathVariable Integer attendanceId, HttpServletRequest request) {
        return service.get(attendanceId, email(request));
    }

    @PostMapping
    public QuoteResponseDto save(@Valid @RequestBody QuoteSaveDto data, HttpServletRequest request) {
        return service.save(data, email(request));
    }

    private String email(HttpServletRequest request) {
        return tokenService.validToken(request.getHeader("Authorization").replace("Bearer ", ""));
    }
}
