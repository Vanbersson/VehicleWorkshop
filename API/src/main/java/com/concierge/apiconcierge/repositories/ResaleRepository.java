package com.concierge.apiconcierge.repositories;

import com.concierge.apiconcierge.models.resales.Resale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResaleRepository extends JpaRepository<Resale, Integer> {

    Resale findByCnpj(String cnpj);

    Resale findByCompanyIdAndCnpj(Integer companyId, String cnpj);

    Resale findByCompanyIdAndId(Integer companyId, Integer id);

    List<Resale> findByCompanyId(Integer companyId);
}
