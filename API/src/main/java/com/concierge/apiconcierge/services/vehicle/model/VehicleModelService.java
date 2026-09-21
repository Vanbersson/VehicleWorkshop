package com.concierge.apiconcierge.services.vehicle.model;

import com.concierge.apiconcierge.exceptions.vehicle.VehicleModelException;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.vehicle.model.VehicleModel;
import com.concierge.apiconcierge.repositories.vehicle.model.IVehicleModelRepository;
import com.concierge.apiconcierge.util.ConstantsMessage;
import com.concierge.apiconcierge.validation.vehicle.model.VehicleModelValidation;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class VehicleModelService implements IVehicleModelService {

    @Autowired
    IVehicleModelRepository repository;

    @Autowired
    VehicleModelValidation validation;

    @SneakyThrows
    @Override
    public MessageResponse save(VehicleModel mod) {
        try {
            MessageResponse response = this.validation.save(mod);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                mod.setId(null);
                VehicleModel result = this.repository.save(mod);
                response.setData(result);
            }
            return response;
        } catch (Exception ex) {
            throw new VehicleModelException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse update(VehicleModel mod) {
        try {
            MessageResponse response = this.validation.update(mod);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                VehicleModel result = this.repository.save(mod);
                response.setData(result);
            }
            return response;
        } catch (Exception ex) {
            throw new VehicleModelException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public List<VehicleModel> listAll(Integer companyId, Integer resaleId) {
        try {
            String message = this.validation.listAll(companyId, resaleId);
            if (ConstantsMessage.SUCCESS.equals(message)) {
                return this.repository.listAll(companyId, resaleId);
            } else {
                throw new VehicleModelException(message);
            }
        } catch (Exception ex) {
            throw new VehicleModelException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public List<VehicleModel> listAllEnabled(Integer companyId, Integer resaleId) {
        try {
            String message = this.validation.listAllEnabled(companyId, resaleId);
            if (ConstantsMessage.SUCCESS.equals(message)) {
                return this.repository.listAllEnabled(companyId, resaleId);
            } else {
                throw new VehicleModelException(message);
            }
        } catch (Exception ex) {
            throw new VehicleModelException(ex.getMessage());
        }
    }

}
