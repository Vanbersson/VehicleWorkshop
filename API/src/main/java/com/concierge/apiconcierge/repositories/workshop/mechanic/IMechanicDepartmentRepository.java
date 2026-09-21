package com.concierge.apiconcierge.repositories.workshop.mechanic;

import com.concierge.apiconcierge.models.workshop.mechanic.MechanicDepartment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface IMechanicDepartmentRepository extends JpaRepository<MechanicDepartment, Integer> {
    @Query(value = "SELECT * FROM `tb_mechanic_department` WHERE company_id=?1 AND resale_id=?2 ", nativeQuery = true)
    List<MechanicDepartment> listAll(Integer companyId, Integer resaleId);

    @Query(value = "SELECT * FROM `tb_mechanic_department` WHERE company_id=?1 AND resale_id=?2 AND status=0 ", nativeQuery = true)
    List<MechanicDepartment> listAllEnabled(Integer companyId, Integer resaleId);
}
