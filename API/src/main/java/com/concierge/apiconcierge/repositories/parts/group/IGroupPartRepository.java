package com.concierge.apiconcierge.repositories.parts.group;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.part.group.GroupPart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IGroupPartRepository extends JpaRepository<GroupPart, Integer> {

    @Query(value = "SELECT * FROM `tb_part_group` WHERE company_id=?1 and resale_id=?2 ", nativeQuery = true)
    List<GroupPart> listAll(Integer companyId, Integer resaleId);

    @Query(value = "SELECT * FROM `tb_part_group` WHERE company_id=?1 and resale_id=?2 and status=?3 and brand_id=?4", nativeQuery = true)
    List<GroupPart> filterBrand(Integer companyId, Integer resaleId, StatusEnableDisable status, Integer brandId);

    @Query(value = "SELECT * FROM `tb_part_group` WHERE brand_id=?1", nativeQuery = true)
    List<GroupPart> filterBrand(Integer brandId);

    @Query(value = "SELECT COUNT(p.id) AS total FROM tb_part_group AS g\n" +
            "INNER JOIN tb_part AS p ON(g.company_id= p.company_id) AND g.resale_id=p.resale_id AND g.id=p.group_id\n" +
            "WHERE g.company_id=?1 AND g.resale_id=?2 AND p.group_id=?3;",nativeQuery = true)
    Integer filterIsUsed(Integer companyId, Integer resaleId, Integer id);
}
