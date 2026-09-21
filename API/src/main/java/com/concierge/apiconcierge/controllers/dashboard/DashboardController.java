package com.concierge.apiconcierge.controllers.dashboard;

import com.concierge.apiconcierge.controllers.dashboard.interfaces.IDashCountVehiclePenAuthBud;
import com.concierge.apiconcierge.controllers.dashboard.interfaces.IDashValueTotalBudget;
import com.concierge.apiconcierge.dtos.message.MessageResponseDto;
import com.concierge.apiconcierge.models.enums.YesNot;
import com.concierge.apiconcierge.models.vehicle.enums.StatusVehicleEnum;
import com.concierge.apiconcierge.repositories.vehicle.entry.IVehicleEntryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    @Autowired
    IVehicleEntryRepository repository;

    @GetMapping("/{companyId}/{resaleId}/count/vehicle")
    public ResponseEntity<Object> countVehicle(@PathVariable(name = "companyId") Integer companyId,
                                                @PathVariable(name = "resaleId") Integer resaleId) {
        try {
            IDashCountVehiclePenAuthBud countVehicle = this.repository.countVehicles(companyId, resaleId, StatusVehicleEnum.Entered);
            List<Object> listVehicle = new ArrayList<>();
            listVehicle.add(countVehicle.getVehicle());
            listVehicle.add(countVehicle.getAuthorized());
            return ResponseEntity.status(HttpStatus.OK).body(listVehicle);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/filter/yes/service/year/{year}")
    public ResponseEntity<Object> filterServiceYear(@PathVariable(name = "companyId") Integer companyId,
                                                    @PathVariable(name = "resaleId") Integer resaleId,
                                                    @PathVariable(name = "year") Integer year) {
        try {
            var month = this.repository.countServiceMonth(companyId, resaleId, YesNot.yes, year);
            return ResponseEntity.status(HttpStatus.OK).body(month);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/filter/not/service/year/{year}")
    public ResponseEntity<Object> filterNotServiceYear(@PathVariable(name = "companyId") Integer companyId,
                                                       @PathVariable(name = "resaleId") Integer resaleId,
                                                       @PathVariable(name = "year") Integer year) {
        try {
            var month = this.repository.countServiceMonth(companyId, resaleId, YesNot.not, year);
            return ResponseEntity.status(HttpStatus.OK).body(month);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/filter/yes/service/year/{year}/client/{id}")
    public ResponseEntity<Object> filterServiceYearClient(@PathVariable(name = "companyId") Integer companyId,
                                                          @PathVariable(name = "resaleId") Integer resaleId,
                                                          @PathVariable(name = "year") Integer year,
                                                          @PathVariable(name = "id") Integer id) {
        try {
            var month = this.repository.countServiceMonthClient(companyId, resaleId, YesNot.yes, year, id);
            return ResponseEntity.status(HttpStatus.OK).body(month);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/filter/vehicle/year/{year}")
    public ResponseEntity<Object> filterCountVehicleMonth(@PathVariable(name = "companyId") Integer companyId,
                                                          @PathVariable(name = "resaleId") Integer resaleId,
                                                          @PathVariable(name = "year") Integer year) {
        try {
            var month = this.repository.countVehicleMonth(companyId, resaleId, year);
            return ResponseEntity.status(HttpStatus.OK).body(month);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/filter/vehicle/year/{year}/client/{id}")
    public ResponseEntity<Object> filterCountVehicleClientMonth(@PathVariable(name = "companyId") Integer companyId,
                                                                @PathVariable(name = "resaleId") Integer resaleId,
                                                                @PathVariable(name = "year") Integer year,
                                                                @PathVariable(name = "id") Integer id) {
        try {
            var month = this.repository.countVehicleClientMonth(companyId, resaleId, year, id);
            return ResponseEntity.status(HttpStatus.OK).body(month);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

}
