package com.concierge.apiconcierge.services.workshop.toolcontrol.category;

import com.concierge.apiconcierge.exceptions.workshop.toolcontrol.ToolControlException;
import com.concierge.apiconcierge.models.workshop.toolcontrol.ToolControlCategory;
import com.concierge.apiconcierge.repositories.workshop.toolcontrol.IToolControlCategoryRepository;
import com.concierge.apiconcierge.util.ConstantsMessage;
import com.concierge.apiconcierge.validation.workshop.toolcontrol.category.ToolControlCategoryValidation;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ToolControlCategoryService implements IToolControlCategoryService {

    @Autowired
    IToolControlCategoryRepository repository;

    @Autowired
    ToolControlCategoryValidation validation;

    @SneakyThrows
    @Override
    public Map<String, Object> save(ToolControlCategory cat) {
        try {
            String message = this.validation.save(cat);
            if (ConstantsMessage.SUCCESS.equals(message)) {
                cat.setId(null);
                ToolControlCategory resultMec = this.repository.save(cat);
                Map<String, Object> map = new HashMap<>();
                map.put("id", resultMec.getId());
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
    public String update(ToolControlCategory cat) {
        try {
            String message = this.validation.update(cat);
            if (ConstantsMessage.SUCCESS.equals(message)) {
                ToolControlCategory resultMec = this.repository.save(cat);
                return ConstantsMessage.SUCCESS;
            } else {
                throw new ToolControlException(message);
            }
        } catch (Exception ex) {
            throw new ToolControlException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public List<ToolControlCategory> listAll(Integer companyId, Integer resaleId) {
        try {
            String message = this.validation.listAll(companyId, resaleId);
            if (ConstantsMessage.SUCCESS.equals(message)) {
                return  this.repository.listAll(companyId, resaleId);
            } else {
                throw new ToolControlException(message);
            }
        } catch (Exception ex) {
            throw new ToolControlException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public List<ToolControlCategory> listAllEnabled(Integer companyId, Integer resaleId) {
        try {
            String message = this.validation.listAllEnabled(companyId, resaleId);
            if (ConstantsMessage.SUCCESS.equals(message)) {
                return  this.repository.listAllEnabled(companyId, resaleId);
            } else {
                throw new ToolControlException(message);
            }
        } catch (Exception ex) {
            throw new ToolControlException(ex.getMessage());
        }
    }

}
