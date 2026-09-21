package com.concierge.apiconcierge.services.payment;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.payment.TypePayment;

import java.util.List;

public interface ITypePaymentService {
    public MessageResponse save(TypePayment pay);

    public MessageResponse update(TypePayment pay);

    List<TypePayment> listAll(Integer companyId, Integer resaleId);

    List<TypePayment> listAllEnabled(Integer companyId, Integer resaleId);
}
