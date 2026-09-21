package com.concierge.apiconcierge.services.workshop.toolcontrol.category;

import com.concierge.apiconcierge.models.workshop.toolcontrol.ToolControlCategory;
import java.util.List;
import java.util.Map;

public interface IToolControlCategoryService {

    Map<String, Object> save(ToolControlCategory cat);

    String update(ToolControlCategory cat);

    List<ToolControlCategory> listAll(Integer companyId, Integer resaleId);

    List<ToolControlCategory> listAllEnabled(Integer companyId, Integer resaleId);
}
