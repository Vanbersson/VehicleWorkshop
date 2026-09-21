package com.concierge.apiconcierge.validation.workshop.toolcontrol.category;

import com.concierge.apiconcierge.models.workshop.toolcontrol.ToolControlCategory;

import java.util.List;
import java.util.Map;

public interface IToolControlCategoryValidation {
    String save(ToolControlCategory cat);

    String update(ToolControlCategory cat);

    String listAll(Integer companyId, Integer resaleId);

    String listAllEnabled(Integer companyId, Integer resaleId);
}
