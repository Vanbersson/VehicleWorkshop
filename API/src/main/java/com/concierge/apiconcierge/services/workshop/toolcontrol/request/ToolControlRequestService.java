package com.concierge.apiconcierge.services.workshop.toolcontrol.request;

import com.concierge.apiconcierge.exceptions.workshop.toolcontrol.ToolControlException;
import com.concierge.apiconcierge.models.workshop.toolcontrol.ToolControlRequest;
import com.concierge.apiconcierge.models.workshop.toolcontrol.enums.StatusRequest;
import com.concierge.apiconcierge.repositories.workshop.toolcontrol.IToolControlRequestRepository;
import com.concierge.apiconcierge.util.ConstantsMessage;
import com.concierge.apiconcierge.validation.workshop.toolcontrol.request.IToolControlRequestValidation;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ToolControlRequestService implements IToolControlRequestService {

    @Autowired
    private IToolControlRequestRepository repository;

    @Autowired
    private IToolControlRequestValidation validation;

    @SneakyThrows
    @Override
    public ToolControlRequest newRequest(ToolControlRequest req) {
        try {
            String message = this.validation.newRequest(req);
            if (ConstantsMessage.SUCCESS.equals(message)) {
                req.setId(null);
                ToolControlRequest result = this.repository.save(req);
                return result;
            } else {
                throw new ToolControlException(message);
            }
        } catch (Exception ex) {
            throw new ToolControlException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public ToolControlRequest updateRequest(ToolControlRequest req) {
        try {
            String message = this.validation.updateRequest(req);
            if (ConstantsMessage.SUCCESS.equals(message)) {
                ToolControlRequest result = this.repository.save(req);
                return result;
            } else {
                throw new ToolControlException(message);
            }
        } catch (Exception ex) {
            throw new ToolControlException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public Map<String, Object> loanReturn(ToolControlRequest req) {
        try {
            String message = this.validation.loanReturn(req);
            if (ConstantsMessage.SUCCESS.equals(message)) {
                req.setId(null);
                ToolControlRequest result = this.repository.save(req);
                Map<String, Object> map = new HashMap<>();
                map.put("id", result.getId());
                return map;
            } else {
                throw new ToolControlException(message);
            }
        } catch (Exception ex) {
            throw new ToolControlException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public ToolControlRequest filterId(Integer companyId, Integer resaleId, Integer requestId) {
        try {
            String message = this.validation.filterId(companyId, resaleId, requestId);
            if (ConstantsMessage.SUCCESS.equals(message)) {
                return this.repository.filterId(companyId, resaleId, requestId);
            } else {
                throw new ToolControlException(message);
            }
        } catch (Exception ex) {
            throw new ToolControlException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public List<ToolControlRequest> filterMechanicId(Integer companyId, Integer resaleId, Integer mechanicId) {
        try {
            String message = this.validation.filterMechanicId(companyId, resaleId, mechanicId);
            if (ConstantsMessage.SUCCESS.equals(message)) {
                List<ToolControlRequest> listResult = new ArrayList<>();
                List<ToolControlRequest> listOpen = this.repository.filterMechanicId(companyId, resaleId, StatusRequest.Open, mechanicId);
                List<ToolControlRequest> listDelivery = this.repository.filterMechanicId(companyId, resaleId, StatusRequest.Delivered, mechanicId);
                listResult.addAll(listOpen);
                listResult.addAll(listDelivery);
                return listResult;
            } else {
                throw new ToolControlException(message);
            }
        } catch (Exception ex) {
            throw new ToolControlException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public List<ToolControlRequest> listAllStatus(Integer companyId, Integer resaleId, StatusRequest status) {
        try {
            String message = this.validation.listAllStatus(companyId, resaleId, status);
            if (ConstantsMessage.SUCCESS.equals(message)) {
                return this.repository.listAllStatus(companyId, resaleId, status);
            } else {
                throw new ToolControlException(message);
            }
        } catch (Exception ex) {
            throw new ToolControlException(ex.getMessage());
        }
    }


}
