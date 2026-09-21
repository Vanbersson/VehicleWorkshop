package com.concierge.apiconcierge.repositories.user;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IUserRepository extends JpaRepository<User, Integer> {

    @Query(value = "SELECT * FROM `tb_user` WHERE company_id=?1 and resale_id=?2", nativeQuery = true)
    List<User> listAll(Integer companyId, Integer resaleId);

    @Query(value = "SELECT * FROM tb_user WHERE company_id=?1 AND resale_id=?2 AND status=?3 AND role_id=?4", nativeQuery = true)
    List<User> filterRoleId(Integer companyId, Integer resaleId, StatusEnableDisable status, Integer roleId);

    @Query(value = "SELECT * FROM tb_user WHERE company_id=?1 AND resale_id=?2 AND id=?3", nativeQuery = true)
    User filterId(Integer companyId, Integer resaleId, Integer id);

    @Query(value = "SELECT * FROM tb_user WHERE company_id=?1 AND resale_id=?2 AND email=?3", nativeQuery = true)
    User filterEmail(Integer companyId, Integer resaleId, String email);

    @Query(value = "SELECT * FROM tb_user WHERE email=?1", nativeQuery = true)
    User loginEmail(String email);


}
