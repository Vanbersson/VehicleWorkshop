package com.concierge.apiconcierge.repositories.reports.concierge;

import com.concierge.apiconcierge.dtos.reports.concierge.VehicleReportDto;
import com.concierge.apiconcierge.models.enums.YesNot;
import com.concierge.apiconcierge.models.vehicle.entry.VehicleEntry;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.*;

@Repository
public class VehicleReportRepository {

    @PersistenceContext
    private EntityManager em;

    public List<VehicleEntry> filterVehicles(VehicleReportDto vehicleFilters) {
        CriteriaBuilder cb = em.getCriteriaBuilder();
        CriteriaQuery<VehicleEntry> cq = cb.createQuery(VehicleEntry.class);
        Root<VehicleEntry> vehicle = cq.from(VehicleEntry.class);

        List<Predicate> predicates = new ArrayList<>();
        predicates.add(cb.equal(vehicle.get("companyId"), vehicleFilters.companyId()));
        predicates.add(cb.equal(vehicle.get("resaleId"), vehicleFilters.resaleId()));

        if (vehicleFilters.dateInit() != null && vehicleFilters.dateFinal() != null) {
            LocalDateTime dateInit = vehicleFilters.dateInit().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
            // Criar intervalo de 00:00:00 até 23:59:59
            LocalDateTime dateInitStart = dateInit.withHour(0).withMinute(0).withSecond(0).withNano(0);
            // Converter de volta para Date
            Date initStartDate = Date.from(dateInitStart.atZone(ZoneId.systemDefault()).toInstant());

            LocalDateTime dateFinal = vehicleFilters.dateFinal().toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
            // Criar intervalo de 00:00:00 até 23:59:59
            LocalDateTime datefinalEnd = dateFinal.withHour(23).withMinute(59).withSecond(59).withNano(0);
            Date initEndDate = Date.from(datefinalEnd.atZone(ZoneId.systemDefault()).toInstant());

            switch (vehicleFilters.type()) {
                case "E":
                    predicates.add(cb.or(cb.between(vehicle.get("entryDate"), initStartDate, initEndDate)));
                    break;
                case "S":
                    predicates.add(cb.or(cb.between(vehicle.get("exitDate"), initStartDate, initEndDate)));
                    break;
                case "A":
                    Predicate dateEntryPredicate = cb.between(vehicle.get("entryDate"), initStartDate, initEndDate);
                    Predicate dateExitPredicate = cb.between(vehicle.get("exitDate"), initStartDate, initEndDate);
                    predicates.add(cb.or(dateEntryPredicate, cb.or(dateExitPredicate)));
                    break;
            }
        }else{
            switch (vehicleFilters.type()) {
                case "E":
                    predicates.add(cb.isNull(vehicle.get("exitDate")));
                    break;
                case "S":
                    predicates.add(cb.isNotNull(vehicle.get("exitDate")));
                    break;
                case "A":
                    break;
            }
        }
        if (vehicleFilters.userAttendantId() != null && vehicleFilters.userAttendantId() != 0)
            predicates.add(cb.equal(vehicle.get("attendantUserId"), vehicleFilters.userAttendantId()));
        if (vehicleFilters.clientId() != null && vehicleFilters.clientId() != 0)
            predicates.add(cb.equal(vehicle.get("clientCompanyId"), vehicleFilters.clientId()));
        if (vehicleFilters.modelId() != null && vehicleFilters.modelId() != 0)
            predicates.add(cb.equal(vehicle.get("modelId"), vehicleFilters.modelId()));
        if (vehicleFilters.vehicleId() != null && vehicleFilters.vehicleId() != 0)
            predicates.add(cb.equal(vehicle.get("id"), vehicleFilters.vehicleId()));
        if (!vehicleFilters.vehiclePlate().isBlank())
            predicates.add(cb.equal(vehicle.get("vehiclePlate"), vehicleFilters.vehiclePlate()));
        if (!vehicleFilters.vehicleFleet().isBlank())
            predicates.add(cb.equal(vehicle.get("vehicleFleet"), vehicleFilters.vehicleFleet()));
        if (!vehicleFilters.numServiceOrder().isBlank())
            predicates.add(cb.equal(vehicle.get("numServiceOrder"), vehicleFilters.numServiceOrder()));
        if (vehicleFilters.vehicleNew() == YesNot.yes)
            predicates.add(cb.equal(vehicle.get("vehicleNew"), vehicleFilters.vehicleNew()));
        cq.where(predicates.toArray(new Predicate[0]));
        return em.createQuery(cq).getResultList();
    }
}
