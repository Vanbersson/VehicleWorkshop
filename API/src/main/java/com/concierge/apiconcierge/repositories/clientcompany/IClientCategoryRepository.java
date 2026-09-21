package com.concierge.apiconcierge.repositories.clientcompany;

import com.concierge.apiconcierge.models.clientcompany.ClientCategory;
import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IClientCategoryRepository extends JpaRepository<ClientCategory, Integer> {

    @Query(value = "SELECT * FROM `tb_client_category` WHERE company_id=?1 AND resale_id=?2", nativeQuery = true)
    List<ClientCategory> listAll(Integer companyId, Integer resaleId);

    @Query(value = "SELECT * FROM `tb_client_category` WHERE company_id=?1 AND resale_id=?2 AND status=?3", nativeQuery = true)
    List<ClientCategory> listAllStatus(Integer companyId, Integer resaleId, StatusEnableDisable status);

    @Query(value = "SELECT * FROM `tb_client_category` WHERE company_id=?1 AND resale_id=?2 AND id=?3", nativeQuery = true)
    ClientCategory filterId(Integer companyId, Integer resaleId, Integer id);

}
