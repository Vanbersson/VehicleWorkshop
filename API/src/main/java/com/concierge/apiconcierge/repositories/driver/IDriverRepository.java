package com.concierge.apiconcierge.repositories.driver;

import com.concierge.apiconcierge.models.driver.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IDriverRepository extends JpaRepository<Driver, Integer> {
    @Query(value = "SELECT * FROM `tb_driver` WHERE company_id=?1 AND resale_id=?2", nativeQuery = true)
    List<Driver> listAll(Integer companyId, Integer resaleId);

    @Query(value = "SELECT * FROM `tb_driver` WHERE company_id=?1 AND resale_id=?2 AND id=?3 ", nativeQuery = true)
    Driver filterId(Integer companyId, Integer resaleId, Integer id);

    @Query(value = "SELECT * FROM `tb_driver` WHERE company_id=?1 AND resale_id=?2 AND name like %?3% ", nativeQuery = true)
    List<Driver> filterName(Integer companyId, Integer resaleId, String rg);

    @Query(value = "SELECT * FROM `tb_driver` WHERE company_id=?1 AND resale_id=?2 AND cpf=?3 ", nativeQuery = true)
    Driver filterCPF(Integer companyId, Integer resaleId, String cpf);

    @Query(value = "SELECT * FROM `tb_driver` WHERE company_id=?1 AND resale_id=?2 AND rg=?3 ", nativeQuery = true)
    Driver filterRG(Integer companyId, Integer resaleId, String rg);

    @Query(value = "SELECT * FROM `tb_driver` WHERE company_id=?1 AND resale_id=?2 AND cnh_register=?3 ", nativeQuery = true)
    Driver filterCNHRegister(Integer companyId, Integer resaleId, String cnhRegister);
}
