package com.concierge.apiconcierge.services.parts.category;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.part.category.PartCategory;

import java.util.List;

public interface IPartCategoryService {
    public MessageResponse save(PartCategory cat);

    public MessageResponse update(PartCategory cat);

    List<PartCategory> listAll(Integer companyId, Integer resaleId);

    List<PartCategory> listAllEnabled(Integer companyId, Integer resaleId);
}
