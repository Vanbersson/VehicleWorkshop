package com.concierge.apiconcierge.services.parts.unit;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.part.unit.UnitMeasure;
import com.concierge.apiconcierge.repositories.parts.unit.IUnitMeasureRepository;
import com.concierge.apiconcierge.util.ConstantsMessage;
import com.concierge.apiconcierge.validation.parts.unit.IUnitMeasureValidation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UnitMeasureService implements IUnitMeasureService {
    @Autowired
    private IUnitMeasureRepository repository;
    @Autowired
    private IUnitMeasureValidation validation;

    @Override
    public MessageResponse save(UnitMeasure un) {
        try {
            MessageResponse response = this.validation.save(un);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                un.setId(null);
                this.repository.save(un);
            }
            return response;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public MessageResponse update(UnitMeasure un) {
        try {
            MessageResponse response = this.validation.update(un);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                this.repository.save(un);
            }
            return response;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public List<UnitMeasure> listAll() {
        try {
            return this.repository.findAll();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @Override
    public List<UnitMeasure> listAllEnabled() {
        try {
            return this.repository.listAllEnabled(StatusEnableDisable.Habilitado);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
