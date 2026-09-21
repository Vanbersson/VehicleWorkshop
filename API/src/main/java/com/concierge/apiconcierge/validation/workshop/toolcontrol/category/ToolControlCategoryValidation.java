package com.concierge.apiconcierge.validation.workshop.toolcontrol.category;

import com.concierge.apiconcierge.models.workshop.toolcontrol.ToolControlCategory;
import com.concierge.apiconcierge.util.ConstantsMessage;
import org.springframework.stereotype.Service;

@Service
public class ToolControlCategoryValidation implements IToolControlCategoryValidation {
    @Override
    public String save(ToolControlCategory cat) {
        if (cat.getCompanyId() == null || cat.getCompanyId() == 0)
            return ConstantsMessage.ERROR_COMPANY;
        if (cat.getResaleId() == null || cat.getResaleId() == 0)
            return ConstantsMessage.ERROR_RESALE;
        if (cat.getStatus() == null)
            return ConstantsMessage.ERROR_STATUS;
        if (cat.getType() == null)
            return "Type not informed.";
        if (cat.getQuantityReq() == null)
            return "Quantity request not informed.";
        if (cat.getDescription().isBlank())
            return ConstantsMessage.ERROR_NAME;

        return ConstantsMessage.SUCCESS;
    }

    @Override
    public String update(ToolControlCategory cat) {
        if (cat.getCompanyId() == null || cat.getCompanyId() == 0)
            return ConstantsMessage.ERROR_COMPANY;
        if (cat.getResaleId() == null || cat.getResaleId() == 0)
            return ConstantsMessage.ERROR_RESALE;
        if (cat.getId() == null || cat.getId() == 0)
            return ConstantsMessage.ERROR_ID;
        if (cat.getStatus() == null)
            return ConstantsMessage.ERROR_STATUS;
        if (cat.getDescription().isBlank())
            return ConstantsMessage.ERROR_NAME;

        return ConstantsMessage.SUCCESS;
    }

    @Override
    public String listAll(Integer companyId, Integer resaleId) {
        if (companyId == null || companyId == 0)
            return ConstantsMessage.ERROR_COMPANY;
        if (resaleId == null || resaleId == 0)
            return ConstantsMessage.ERROR_RESALE;

        return ConstantsMessage.SUCCESS;
    }

    @Override
    public String listAllEnabled(Integer companyId, Integer resaleId) {
        if (companyId == null || companyId == 0)
            return ConstantsMessage.ERROR_COMPANY;
        if (resaleId == null || resaleId == 0)
            return ConstantsMessage.ERROR_RESALE;

        return ConstantsMessage.SUCCESS;
    }
}
