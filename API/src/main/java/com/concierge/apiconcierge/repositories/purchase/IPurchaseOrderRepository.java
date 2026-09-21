package com.concierge.apiconcierge.repositories.purchase;

import com.concierge.apiconcierge.models.purchase.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IPurchaseOrderRepository extends JpaRepository<PurchaseOrder, Integer> {

    @Query(value = "SELECT * FROM `tb_purchase_order` WHERE company_id=?1 AND resale_id=?2 AND STATUS=0", nativeQuery = true)
    public List<PurchaseOrder> filterOpen(Integer companyId, Integer resaleId);


    @Query(value = "SELECT * FROM `tb_purchase_order` WHERE company_id=?1 AND resale_id=?2 AND id=?3", nativeQuery = true)
    public PurchaseOrder filterId(Integer companyId, Integer resaleId, Integer purchaseId);
}
