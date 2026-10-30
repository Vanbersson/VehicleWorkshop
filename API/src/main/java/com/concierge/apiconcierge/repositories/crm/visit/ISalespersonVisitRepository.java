package com.concierge.apiconcierge.repositories.crm.visit;

import com.concierge.apiconcierge.models.crm.visit.SalespersonVisit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ISalespersonVisitRepository extends JpaRepository<SalespersonVisit, Integer> {

    SalespersonVisit findByCompanyIdAndResaleIdAndId(Integer companyId,Integer resaleId, Integer id);
}
