package com.concierge.apiconcierge.repositories.workshop.mechanic;

import com.concierge.apiconcierge.models.workshop.mechanic.Mechanic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IMechanicRepository extends JpaRepository<Mechanic, Integer> {

    @Query(value = "SELECT * FROM `tb_mechanic` WHERE company_id=?1 AND resale_id=?2 AND code_password=?3 ", nativeQuery = true)
    Mechanic filterCodePass(Integer companyId, Integer resaleId, Integer codePass);

    @Query(value = "SELECT * FROM `tb_mechanic` WHERE company_id=?1 AND resale_id=?2 ", nativeQuery = true)
    List<Mechanic> listAll(Integer companyId, Integer resaleId);

    @Query(value = "SELECT * FROM `tb_mechanic` WHERE company_id=?1 AND resale_id=?2 AND status=0 ", nativeQuery = true)
    List<Mechanic> listAllEnabled(Integer companyId, Integer resaleId);

    @Query(value = "SELECT * FROM `tb_mechanic` WHERE company_id=?1 AND resale_id=?2 AND id=?3 ", nativeQuery = true)
    Mechanic filterId(Integer companyId, Integer resaleId, Integer id);
}
