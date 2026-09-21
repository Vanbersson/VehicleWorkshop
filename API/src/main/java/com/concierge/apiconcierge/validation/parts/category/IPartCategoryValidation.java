package com.concierge.apiconcierge.validation.parts.category;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.part.category.PartCategory;

public interface IPartCategoryValidation {
    public MessageResponse save(PartCategory cat);

    public MessageResponse update(PartCategory cat);

    public MessageResponse listAll(Integer companyId, Integer resaleId);
}
