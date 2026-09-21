package com.concierge.apiconcierge.repositories.purchase;

import com.concierge.apiconcierge.models.purchase.item.PurchaseOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface IPurchaseOrderItemRepository extends JpaRepository<PurchaseOrderItem, UUID> {

    @Query(value = "SELECT * FROM `tb_purchase_order_item` WHERE company_id=?1 AND resale_id=?2 AND purchase_id=?3 order by item_order", nativeQuery = true)
    List<PurchaseOrderItem> filterPurchaseOrderId(Integer companyId, Integer resaleId, Integer purchaseId);

    @Transactional
    @Modifying
    @Query(value = "    DELETE FROM `tb_purchase_order_item` WHERE company_id=?1 AND resale_id=?2 AND purchase_id=?3 AND item_order=?4 AND item_id=?5", nativeQuery = true)
    void deleteItem(Integer companyId, Integer resaleId, Integer purchaseId, Integer itemOrder, Integer itemId);

}
