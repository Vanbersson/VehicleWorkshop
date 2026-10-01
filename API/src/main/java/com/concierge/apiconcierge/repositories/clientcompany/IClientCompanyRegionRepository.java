package com.concierge.apiconcierge.repositories.clientcompany;

import com.concierge.apiconcierge.models.clientcompany.ClientCompanyRegion;
import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IClientCompanyRegionRepository extends JpaRepository<ClientCompanyRegion,Integer> {

    @Query(value = "SELECT * FROM `tb_client_company_region` WHERE company_id=?1 AND resale_id=?2", nativeQuery = true)
    List<ClientCompanyRegion> listAll(Integer companyId, Integer resaleId);

    @Query(value = "SELECT * FROM `tb_client_company_region` WHERE company_id=?1 AND resale_id=?2 AND status=?3", nativeQuery = true)
    List<ClientCompanyRegion> listAllEnabled(Integer companyId, Integer resaleId, StatusEnableDisable status);
}
