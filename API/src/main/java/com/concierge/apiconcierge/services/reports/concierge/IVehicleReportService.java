package com.concierge.apiconcierge.services.reports.concierge;

import com.concierge.apiconcierge.dtos.reports.concierge.VehicleReportDto;

import java.util.List;

public interface IVehicleReportService {
    public List<Object> filterVehicles(VehicleReportDto vehicle);
}
