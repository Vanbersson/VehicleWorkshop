package com.concierge.apiconcierge.services.workshop.report;

import com.concierge.apiconcierge.models.workshop.toolcontrol.report.IToolControlReport;

import java.util.List;
import java.util.Map;

public interface IToolControlReportService {

    Map<String, Object> filterMechanic(Integer companyId, Integer resaleId, Integer mechanicId);

    Map<String, Object> filterMechanicId(Integer companyId, Integer resaleId, Integer mechanicId);
}
