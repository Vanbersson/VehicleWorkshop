package com.concierge.apiconcierge.repositories.user;

import com.concierge.apiconcierge.models.role.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IUserRoleRepository extends JpaRepository<UserRole, Integer> {


    @Query(value = "SELECT * FROM `tb_user_role` WHERE company_id=?1 AND resale_id=?2 and STATUS = 0",nativeQuery = true)
    List<UserRole> listAllEnabled(Integer companyId, Integer resaleId);

    @Query(value = "SELECT * FROM `tb_user_role` WHERE company_id=?1 AND resale_id=?2",nativeQuery = true)
    List<UserRole> listAll(Integer companyId, Integer resaleId);

}
