package com.concierge.apiconcierge.services.reports.concierge;

import com.concierge.apiconcierge.dtos.reports.concierge.VehicleReportDto;
import com.concierge.apiconcierge.exceptions.vehicle.VehicleEntryException;
import com.concierge.apiconcierge.models.vehicle.entry.VehicleEntry;
import com.concierge.apiconcierge.repositories.vehicle.entry.IVehicleEntryRepository;
import com.concierge.apiconcierge.repositories.reports.concierge.VehicleReportRepository;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class VehicleReportService implements IVehicleReportService {

    @Autowired
    private IVehicleEntryRepository repository;

    @Autowired
    private VehicleReportRepository reportRepository;

    @SneakyThrows
    @Override
    public List<Object> filterVehicles(VehicleReportDto ve) {
        try {
            List<VehicleEntry> vehicles = this.reportRepository.filterVehicles(ve);
            List<Object> list = new ArrayList<>();
            for (VehicleEntry vehicle : vehicles) {
                list.add(this.loadObject(vehicle));
            }
            return list;
        } catch (Exception ex) {
            throw new VehicleEntryException(ex.getMessage());
        }
    }

    private Map<String, Object> loadObject(VehicleEntry vehicle) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", vehicle.getId());
        map.put("entryUserName", vehicle.getEntryUserName());
        map.put("entryDate", vehicle.getEntryDate());
        map.put("exitUserName", vehicle.getExitUserName());
        map.put("exitDate", vehicle.getExitDate());
        map.put("attendantUserName", vehicle.getAttendantUserName());
        map.put("modelDescription", vehicle.getModelDescription());
        map.put("clientCompanyName", vehicle.getClientCompanyName());
        map.put("vehiclePlate", vehicle.getVehiclePlate());
        map.put("vehicleFleet", vehicle.getVehicleFleet());
        map.put("vehicleNew", vehicle.getVehicleNew());
        map.put("numServiceOrder", vehicle.getNumServiceOrder());
        return map;
    }

}
