package com.concierge.apiconcierge.repositories.permission;

import com.concierge.apiconcierge.models.permission.PermissionUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface IPermissionUserRepository extends JpaRepository<PermissionUser, UUID> {


    @Query(value = "select * from tb_user_permission where company_id=?1 and resale_id=?2 and user_id=?3", nativeQuery = true)
    List<PermissionUser> listPermissionUser(Integer companyId, Integer resaleId, Integer userId);

    @Query(value = "select * from tb_user_permission where company_id=?1 and resale_id=?2 and user_id=?3 and permission_id=?4", nativeQuery = true)
    PermissionUser findPermissionId(Integer companyId, Integer resaleId, Integer userId, Integer permissionId);

    @Query(value = "select * from tb_user_permission where company_id=?1 and resale_id=?2 and permission_id=?3", nativeQuery = true)
    List<PermissionUser> filterPermissionId(Integer companyId, Integer resaleId, Integer permissionId);

    @Transactional
    @Modifying
    @Query(value = "delete from tb_user_permission where company_id=?1 and resale_id=?2 and user_id=?3", nativeQuery = true)
    void deleteUser(Integer companyId, Integer resaleId, Integer userId);

}
