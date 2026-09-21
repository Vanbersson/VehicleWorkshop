package com.concierge.apiconcierge.repositories.parts;

import com.concierge.apiconcierge.models.part.Part;
import com.concierge.apiconcierge.repositories.parts.interfaces.IFilterPart;
import com.concierge.apiconcierge.services.parts.interfaces.IPartListAll;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IPartRepository extends JpaRepository<Part, Integer> {

    @Query(value = "SELECT p.id AS 'Id',p.status AS 'Status',p.description AS 'Description',p.code AS 'Code',\n" +
            "b.name AS 'Brand',\n" +
            "g.description AS 'Group',\n" +
            "c.description AS 'Category' \n" +
            "FROM tb_part AS p \n" +
            "INNER JOIN tb_brand AS b ON(p.brand_id = b.id) \n" +
            "INNER JOIN tb_part_group AS g ON(p.group_id = g.id) \n" +
            "INNER JOIN tb_part_category AS c ON(p.category_id = c.id) \n" +
            "WHERE p.company_id=?1 AND p.resale_id=?2 \n" +
            "ORDER BY p.id ASC ", nativeQuery = true)
    List<IPartListAll> listAll(Integer companyId, Integer resaleId);

    @Query(value = "SELECT * FROM tb_part WHERE company_id=?1 AND resale_id=?2 AND id=?3", nativeQuery = true)
    Part filterId(Integer companyId, Integer resaleId, Integer id);

    @Query(value = "SELECT * FROM tb_part WHERE company_id=?1 AND resale_id=?2 AND code=?3", nativeQuery = true)
    Part filterCodeUnique(Integer companyId, Integer resaleId, String code);

    @Query(value = "SELECT p.id AS 'Id',p.code AS 'Code',p.description AS 'Description',COALESCE(pm.qtd_available,0)  AS 'Available' ,p.price_now AS 'Price',u.unit_measure AS 'Unit',b.name AS 'Brand',g.description AS 'Group',c.description AS 'Category' \n" +
            "FROM tb_part AS p\n" +
            "LEFT JOIN tb_part_movimentation AS pm ON(p.company_id=pm.company_id) AND p.resale_id=pm.resale_id AND p.id=pm.part_id\n" +
            "INNER JOIN tb_unit_measure AS u ON(p.unit_measure_id = u.id) \n" +
            "INNER JOIN tb_brand AS b ON(p.brand_id = b.id) \n" +
            "INNER JOIN tb_part_group AS g ON(p.company_id=g.company_id) AND p.resale_id=g.resale_id AND (p.group_id = g.id) \n" +
            "INNER JOIN tb_part_category AS c ON(p.company_id=c.company_id) AND p.resale_id=c.resale_id AND (p.category_id = c.id)\n" +
            "WHERE p.company_id=?1 AND p.resale_id=?2 AND p.code like %?3%;", nativeQuery = true)
    List<IFilterPart> filterCode(Integer companyId, Integer resaleId, String code);

    @Query(value = "SELECT p.id AS 'Id',p.code AS 'Code',p.description AS 'Description',COALESCE(pm.qtd_available,0)  AS 'Available' ,p.price_now AS 'Price',u.unit_measure AS 'Unit',b.name AS 'Brand',g.description AS 'Group',c.description AS 'Category' \n" +
            "FROM tb_part AS p\n" +
            "LEFT JOIN tb_part_movimentation AS pm ON(p.company_id=pm.company_id) AND p.resale_id=pm.resale_id AND p.id=pm.part_id\n" +
            "INNER JOIN tb_unit_measure AS u ON(p.unit_measure_id = u.id) \n" +
            "INNER JOIN tb_brand AS b ON(p.brand_id = b.id) \n" +
            "INNER JOIN tb_part_group AS g ON(p.company_id=g.company_id) AND p.resale_id=g.resale_id AND (p.group_id = g.id) \n" +
            "INNER JOIN tb_part_category AS c ON(p.company_id=c.company_id) AND p.resale_id=c.resale_id AND (p.category_id = c.id)\n" +
            "WHERE p.company_id=?1 AND p.resale_id=?2 AND p.description like %?3%;",nativeQuery = true)
    List<IFilterPart> filterDesc(Integer companyId, Integer resaleId, String desc);
}
