package com.concierge.apiconcierge.repositories.payment;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.payment.TypePayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ITypePaymentRepository extends JpaRepository<TypePayment, Integer> {

    @Query(value = "SELECT * FROM `tb_payment_type` WHERE company_id=?1 AND resale_id=?2 ", nativeQuery = true)
    List<TypePayment> listAll(Integer companyId, Integer resaleId);

    @Query(value = "SELECT * FROM `tb_payment_type` WHERE company_id=?1 AND resale_id=?2 AND status=?3 ", nativeQuery = true)
    List<TypePayment> listAllEnabled(Integer companyId, Integer resaleId, StatusEnableDisable status);
}
