package com.concierge.apiconcierge.repositories.salesperson;

import com.concierge.apiconcierge.models.salesperson.Salesperson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ISalespersonRepository extends JpaRepository<Salesperson, Integer> {

    List<Salesperson> findByCompanyIdAndResaleId(Integer companyId, Integer resaleId);

    Salesperson findByCompanyIdAndResaleIdAndId(Integer companyId, Integer resaleId, Integer id);
}
