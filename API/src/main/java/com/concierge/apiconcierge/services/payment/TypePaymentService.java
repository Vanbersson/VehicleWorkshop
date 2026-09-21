package com.concierge.apiconcierge.services.payment;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.payment.TypePayment;
import com.concierge.apiconcierge.repositories.payment.ITypePaymentRepository;
import com.concierge.apiconcierge.util.ConstantsMessage;
import com.concierge.apiconcierge.validation.payment.ITypePaymentValidation;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TypePaymentService implements ITypePaymentService {
    @Autowired
    private ITypePaymentRepository repository;
    @Autowired
    private ITypePaymentValidation validation;

    @Override
    public MessageResponse save(TypePayment pay) {
        try {
            MessageResponse response = this.validation.save(pay);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                pay.setId(null);
                TypePayment result = this.repository.save(pay);
                response.setData(result);
            }
            return response;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public MessageResponse update(TypePayment pay) {
        try {
            MessageResponse response = this.validation.update(pay);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                TypePayment result = this.repository.save(pay);
                response.setData(result);
            }
            return response;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @SneakyThrows
    @Override
    public List<TypePayment> listAll(Integer companyId, Integer resaleId) {
        try {
            MessageResponse response = this.validation.listAll(companyId, resaleId);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                return this.repository.listAll(companyId, resaleId);
            }
            return List.of();
        } catch (Exception ex) {
            throw new Exception(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public List<TypePayment> listAllEnabled(Integer companyId, Integer resaleId) {
        try {
            MessageResponse response = this.validation.listAllEnabled(companyId, resaleId);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                return this.repository.listAllEnabled(companyId, resaleId, StatusEnableDisable.Habilitado);
            }
            return List.of();
        } catch (Exception ex) {
            throw new Exception(ex.getMessage());
        }
    }
}
