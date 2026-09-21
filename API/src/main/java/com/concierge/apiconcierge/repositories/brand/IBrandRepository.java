package com.concierge.apiconcierge.repositories.brand;

import com.concierge.apiconcierge.models.brand.Brand;
import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IBrandRepository extends JpaRepository<Brand, Integer> {

    @Query(value = "SELECT * FROM `tb_brand` WHERE status=?1 ", nativeQuery = true)
    List<Brand> listAllEnabled(StatusEnableDisable status);


}
