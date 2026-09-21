package com.concierge.apiconcierge.repositories.parts.unit;


import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.part.unit.UnitMeasure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IUnitMeasureRepository extends JpaRepository<UnitMeasure, Integer> {
    @Query(value = "SELECT * FROM `tb_unit_measure` WHERE status=?1 ", nativeQuery = true)
    List<UnitMeasure> listAllEnabled(StatusEnableDisable status);

    @Query(value = "SELECT COUNT(p.id) AS total FROM tb_unit_measure AS g\n" +
            "INNER JOIN tb_part AS p ON (g.id=p.unit_measure_id)\n" +
            "WHERE p.unit_measure_id=?1;", nativeQuery = true)
    Integer filterIsUsed(Integer id);
}
