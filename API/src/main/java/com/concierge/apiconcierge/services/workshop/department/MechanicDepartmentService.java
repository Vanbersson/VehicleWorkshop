package com.concierge.apiconcierge.services.workshop.department;

import com.concierge.apiconcierge.exceptions.workshop.mechanic.MechanicException;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.workshop.mechanic.MechanicDepartment;
import com.concierge.apiconcierge.repositories.workshop.mechanic.IMechanicDepartmentRepository;
import com.concierge.apiconcierge.util.ConstantsMessage;
import com.concierge.apiconcierge.validation.workshop.department.IMechanicDepartmentValidation;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MechanicDepartmentService implements IMechanicDepartmentService {
    @Autowired
    private IMechanicDepartmentRepository repository;

    @Autowired
    private IMechanicDepartmentValidation validation;

    @SneakyThrows
    @Override
    public MessageResponse save(MechanicDepartment data) {
        try {
            MessageResponse response = this.validation.save(data);
            if (response.getStatus().equals(ConstantsMessage.SUCCESS)) {
                data.setId(null);
                MechanicDepartment result = this.repository.save(data);
                response.setData(result);
                return response;
            }
            return response;
        } catch (Exception ex) {
            throw new MechanicException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse update(MechanicDepartment data) {
        try {
            MessageResponse response = this.validation.update(data);
            if (response.getStatus().equals(ConstantsMessage.SUCCESS)) {
                MechanicDepartment result = this.repository.save(data);
                response.setData(result);
                return response;
            }
            return response;
        } catch (Exception ex) {
            throw new MechanicException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public List<MechanicDepartment> listAll(Integer companyId, Integer resaleId) {
        try {
            MessageResponse response = this.validation.listAll(companyId, resaleId);
            if (response.getStatus().equals(ConstantsMessage.SUCCESS)) {
                return this.repository.listAll(companyId, resaleId);
            }
            return List.of();
        } catch (Exception ex) {
            throw new MechanicException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public List<MechanicDepartment> listAllEnabled(Integer companyId, Integer resaleId) {
        try {
            MessageResponse response = this.validation.listAll(companyId, resaleId);
            if (response.getStatus().equals(ConstantsMessage.SUCCESS)) {
                return this.repository.listAllEnabled(companyId, resaleId);
            }
            return List.of();
        } catch (Exception ex) {
            throw new MechanicException(ex.getMessage());
        }
    }
}
