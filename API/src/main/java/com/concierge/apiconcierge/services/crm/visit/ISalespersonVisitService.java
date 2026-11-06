package com.concierge.apiconcierge.services.crm.visit;

import com.concierge.apiconcierge.dtos.crm.agenda.SalespersonVisitAgendaNewDto;
import com.concierge.apiconcierge.dtos.crm.agenda.SalespersonVisitAgendaResponseDto;
import com.concierge.apiconcierge.dtos.crm.agenda.SalespersonVisitAgendaUpdateDto;
import com.concierge.apiconcierge.dtos.crm.visit.SalespersonVisitResponseDto;
import com.concierge.apiconcierge.models.crm.visit.SalespersonVisit;
import com.concierge.apiconcierge.models.message.MessageResponse;

import java.util.Date;
import java.util.List;

public interface ISalespersonVisitService {

    List<com.concierge.apiconcierge.dtos.crm.visit.VisitSalespersonOptionDto> creationSalespersons(boolean agenda, String emailUser);

    SalespersonVisit registerNew(SalespersonVisit v, String emailUser);

    SalespersonVisit registerUpdate(SalespersonVisit v, String emailUser);

    com.concierge.apiconcierge.dtos.crm.attendance.AttendanceResponseDto generateAttendance(Integer id, String emailUser);

    SalespersonVisit filterVisit(Integer id, String emailUser);

    MessageResponse agendaNew(SalespersonVisitAgendaNewDto v, String emailUser);

    MessageResponse agendaUpdate(SalespersonVisitAgendaUpdateDto v, String emailUser);

    List<SalespersonVisitResponseDto> listAll(String emailUser);

    List<SalespersonVisitAgendaResponseDto> listAllAgenda(String day, String emailUser);

    List<SalespersonVisitAgendaResponseDto> listOverdueAgenda(String emailUser);


}
