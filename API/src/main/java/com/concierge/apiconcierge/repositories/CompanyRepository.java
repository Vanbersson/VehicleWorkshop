package com.concierge.apiconcierge.repositories;

import com.concierge.apiconcierge.models.companies.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompanyRepository extends JpaRepository<Company,Integer> {

    Company findByCnpj(String cnpj);
}
