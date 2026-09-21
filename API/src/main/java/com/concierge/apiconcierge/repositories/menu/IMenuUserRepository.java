package com.concierge.apiconcierge.repositories.menu;

import com.concierge.apiconcierge.models.menu.IMenuUserReport;
import com.concierge.apiconcierge.models.menu.MenuUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface IMenuUserRepository extends JpaRepository<MenuUser, UUID> {

    @Query(
            value = "SELECT `company_id`, `resale_id`, `id`, `user_id`, `menu_id` FROM `tb_user_menu` WHERE `company_id` = ?1 and `resale_id`= ?2 and `user_id`=?3 and `menu_id`=?4",
            nativeQuery = true)
    MenuUser findMenu(Integer companyId, Integer resaleId, Integer userId, String menuId);

    @Query(value = "SELECT um.company_id AS 'CompanyId',um.resale_id AS 'ResaleId',um.menu_id AS 'Key',m.description AS 'Menu' FROM tb_user_menu AS um\n" +
            "INNER JOIN tb_menu AS m ON (um.menu_id = m.id) AND um.company_id = ?1 AND um.resale_id = ?2 AND um.user_id = ?3\n" +
            "ORDER BY um.menu_id ASC ",
            nativeQuery = true)
    List<IMenuUserReport> filterUserId(Integer companyId, Integer resaleId, Integer userId);

    @Transactional
    @Modifying
    @Query(value = "delete from tb_user_menu where `company_id` = ?1 and `resale_id`= ?2 and user_id=?3 ",
            nativeQuery = true)
    void deleteMenu(Integer companyId, Integer resaleId, Integer userId);


}
