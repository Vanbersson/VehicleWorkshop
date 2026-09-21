package com.concierge.apiconcierge.services.brand;

import com.concierge.apiconcierge.models.brand.Brand;
import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.repositories.brand.IBrandRepository;
import com.concierge.apiconcierge.util.ConstantsMessage;
import com.concierge.apiconcierge.validation.brand.IBrandValidation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BrandService implements IBrandService {
    @Autowired
    private IBrandRepository repository;
    @Autowired
    private IBrandValidation validation;

    @Override
    public MessageResponse save(Brand b) {
        try {
            MessageResponse response = this.validation.save(b);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                b.setId(null);
                this.repository.save(b);
            }
            return response;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public MessageResponse update(Brand b, String userEmail) {
        try {
            MessageResponse response = this.validation.update(b,userEmail);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                this.repository.save(b);
            }
            return response;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public List<Brand> listAll() {
        try {
            return this.repository.findAll();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public List<Brand> listAllEnabled() {
        try {
            return this.repository.listAllEnabled(StatusEnableDisable.Habilitado);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

}
