package com.concierge.apiconcierge.validation.workshop.toolcontrol.request;

import com.concierge.apiconcierge.models.workshop.toolcontrol.ToolControlRequest;
import com.concierge.apiconcierge.models.workshop.toolcontrol.enums.StatusRequest;
import com.concierge.apiconcierge.util.ConstantsMessage;
import org.springframework.stereotype.Service;

@Service
public class ToolControlRequestValidation implements IToolControlRequestValidation {

    @Override
    public String newRequest(ToolControlRequest req) {
        if (req.getCompanyId() == null || req.getCompanyId() == 0)
            return ConstantsMessage.ERROR_COMPANY;
        if (req.getResaleId() == null || req.getResaleId() == 0)
            return ConstantsMessage.ERROR_RESALE;
        if (req.getStatus() != StatusRequest.Open)
            return "Status incorreto.";
        if (req.getRequestType() == null)
            return "Tipo de requisição não informado.";
        if (req.getRequestDate() == null)
            return "Data da requisição não informada.";
        if (req.getCategoryType() == null)
            return "Tipo de categoria não informada.";
        if (req.getMechanicId() == null || req.getMechanicId() == 0)
            return "Mecânico não informado.";

        return ConstantsMessage.SUCCESS;
    }

    @Override
    public String updateRequest(ToolControlRequest req) {
        if (req.getCompanyId() == null || req.getCompanyId() == 0)
            return ConstantsMessage.ERROR_COMPANY;
        if (req.getResaleId() == null || req.getResaleId() == 0)
            return ConstantsMessage.ERROR_RESALE;
        if (req.getId() == null || req.getId() == 0)
            return "Código não informado.";
        if (req.getRequestType() == null)
            return "Tipo de requisição não informado.";
        if (req.getRequestDate() == null)
            return "Data da requisição não informada.";
        if (req.getCategoryType() == null)
            return "Tipo de categoria não informada.";
//        if(req.getDeliveryUserId() == null || req.getDeliveryUserId() == 0)
//            return "Usuário de entrega não informado.";


        if (req.getMechanicId() == null || req.getMechanicId() == 0)
            return "Mecânico não informado.";

        return ConstantsMessage.SUCCESS;
    }

    @Override
    public String loanReturn(ToolControlRequest req) {
        if (req.getCompanyId() == null || req.getCompanyId() == 0)
            return ConstantsMessage.ERROR_COMPANY;
        if (req.getResaleId() == null || req.getResaleId() == 0)
            return ConstantsMessage.ERROR_RESALE;
//        if (req.getUserIdReq() == null || req.getUserIdReq() == 0)
//            return ConstantsMessage.ERROR_USER_ID;
//        if (req.getStatus() == null || req.getStatus() == StatusRequest.Complete)
//            return ConstantsMessage.ERROR_STATUS;
//        if(req.getTypeRequest() == null)
//            return "Type material not informed.";
//        if (req.getDateReq() == null)
//            return "Date request not informed.";
        if (req.getMechanicId() == null || req.getMechanicId() == 0)
            return "Mechanic not informed.";

        return ConstantsMessage.SUCCESS;
    }

    @Override
    public String filterId(Integer companyId, Integer resaleId, Integer requestId) {
        if (companyId == null || companyId == 0)
            return ConstantsMessage.ERROR_COMPANY;
        if (resaleId == null || resaleId == 0)
            return ConstantsMessage.ERROR_RESALE;
        if (requestId == null || requestId == 0)
            return ConstantsMessage.ERROR_RESALE;

        return ConstantsMessage.SUCCESS;
    }

    public String filterMechanicId(Integer companyId, Integer resaleId, Integer mechanicId) {
        if (companyId == null || companyId == 0)
            return ConstantsMessage.ERROR_COMPANY;
        if (resaleId == null || resaleId == 0)
            return ConstantsMessage.ERROR_RESALE;
        if (mechanicId == null || mechanicId == 0)
            return ConstantsMessage.ERROR_ID;

        return ConstantsMessage.SUCCESS;
    }

    public String listAllStatus(Integer companyId, Integer resaleId, StatusRequest status) {
        if (companyId == null || companyId == 0)
            return ConstantsMessage.ERROR_COMPANY;
        if (resaleId == null || resaleId == 0)
            return ConstantsMessage.ERROR_RESALE;
        if (status == null)
            return ConstantsMessage.ERROR_STATUS;

        return ConstantsMessage.SUCCESS;
    }

}
