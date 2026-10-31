package com.concierge.apiconcierge.repositories.crm.visit;

import com.concierge.apiconcierge.models.crm.visit.SalespersonVisit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ISalespersonVisitRepository extends JpaRepository<SalespersonVisit, Integer> {

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select v from SalespersonVisit v where v.companyId = :companyId and v.resaleId = :resaleId and v.id = :id")
    SalespersonVisit findForCompletion(@org.springframework.data.repository.query.Param("companyId") Integer companyId, @org.springframework.data.repository.query.Param("resaleId") Integer resaleId, @org.springframework.data.repository.query.Param("id") Integer id);

    SalespersonVisit findByCompanyIdAndResaleIdAndId(Integer companyId,Integer resaleId, Integer id);
}
