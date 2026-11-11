package com.concierge.apiconcierge.controllers.budget;


import com.concierge.apiconcierge.dtos.message.MessageResponseDto;
import com.concierge.apiconcierge.dtos.budget.BudgetDto;
import com.concierge.apiconcierge.dtos.budget.BudgetNewDto;
import com.concierge.apiconcierge.models.budget.Budget;
import com.concierge.apiconcierge.services.auth.TokenService;
import com.concierge.apiconcierge.services.budget.BudgetService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/vehicle/entry/budget")
public class BudgetController {

    @Autowired
    private BudgetService service;
    @Autowired
    private TokenService tokenService;

    @PostMapping("/save")
    public ResponseEntity<Object> save(@RequestBody BudgetNewDto data, HttpServletRequest request) {
        try {
            String userLoginEmail = this.getEmail(request);

            Integer id = this.service.save(data, userLoginEmail);
            Map<String, Object> map = new HashMap<>();
            map.put("id", id);
            return ResponseEntity.status(HttpStatus.CREATED).body(map);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @PostMapping("/update")
    public ResponseEntity<Object> updateBudget(@RequestBody BudgetDto data, HttpServletRequest request) {
        try {
            String userLoginEmail = this.getEmail(request);
            Budget budget = new Budget();
            BeanUtils.copyProperties(data, budget);
            boolean result = this.service.update(budget, userLoginEmail);
            return ResponseEntity.status(HttpStatus.OK).build();
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @PostMapping("/status/update")
    public ResponseEntity<Object> statusUpdateBudget(@RequestBody BudgetDto data) {
        try {
            Budget budget = new Budget();
            BeanUtils.copyProperties(data, budget);
            String message = this.service.statusUpdate(budget);
            return ResponseEntity.status(HttpStatus.OK).body(new MessageResponseDto(message));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @PostMapping("/openBudget")
    public ResponseEntity<Object> openBudget(@RequestBody BudgetDto data) {
        try {
            Budget budget = new Budget();
            BeanUtils.copyProperties(data, budget);
            String message = this.service.openBudget(budget);
            return ResponseEntity.status(HttpStatus.OK).body(new MessageResponseDto(message));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @PostMapping("/closeBudget")
    public ResponseEntity<Object> closeBudget(@RequestBody BudgetDto data) {
        try {
            Budget budget = new Budget();
            BeanUtils.copyProperties(data, budget);
            String message = this.service.closeBudget(budget);
            return ResponseEntity.status(HttpStatus.OK).body(new MessageResponseDto(message));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/filter/vehicle/{id}")
    public ResponseEntity<Object> getVehicleId(@PathVariable(name = "companyId") Integer companyId,
                                               @PathVariable(name = "resaleId") Integer resaleId,
                                               @PathVariable(name = "id") Integer vehicleId,
                                               HttpServletRequest request) {
        try {
            String userLoginEmail = this.getEmail(request);

            Map<String, Object> budget = this.service.filterVehicleId(companyId, resaleId, vehicleId, userLoginEmail);
            return ResponseEntity.status(HttpStatus.OK).body(budget);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    private String getEmail(HttpServletRequest request) {
        String token = request.getHeader("Authorization").replace("Bearer ", "");
        return this.tokenService.validToken(token);
    }


}
