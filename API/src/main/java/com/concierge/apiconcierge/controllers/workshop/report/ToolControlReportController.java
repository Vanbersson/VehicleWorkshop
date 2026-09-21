package com.concierge.apiconcierge.controllers.workshop.report;

import com.concierge.apiconcierge.dtos.message.MessageResponseDto;
import com.concierge.apiconcierge.services.workshop.report.IToolControlReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/workshop/tool/control/report")
public class ToolControlReportController {

    @Autowired
    private IToolControlReportService service;

    @GetMapping("/{companyId}/{resaleId}/filter/mec/{mechanicId}")
    public ResponseEntity<Object> filterMechanicId(@PathVariable(name = "companyId") Integer companyId,
                                                   @PathVariable(name = "resaleId") Integer resaleId,
                                                   @PathVariable(name = "mechanicId") Integer mechanicId) {
        try {
            Map<String, Object> result = this.service.filterMechanicId(companyId, resaleId, mechanicId);
            if (result.isEmpty())
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            return ResponseEntity.status(HttpStatus.OK).body(result);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

}
