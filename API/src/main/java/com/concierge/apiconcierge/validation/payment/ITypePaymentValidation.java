package com.concierge.apiconcierge.validation.payment;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.payment.TypePayment;

public interface ITypePaymentValidation {

    public MessageResponse save(TypePayment pay);

    public MessageResponse update(TypePayment pay);

    public MessageResponse listAll(Integer companyId, Integer resaleId);

    public MessageResponse listAllEnabled(Integer companyId, Integer resaleId);
}
