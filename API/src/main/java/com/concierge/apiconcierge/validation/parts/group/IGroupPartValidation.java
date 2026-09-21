package com.concierge.apiconcierge.validation.parts.group;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.part.group.GroupPart;

public interface IGroupPartValidation {
    public MessageResponse save(GroupPart g);

    public MessageResponse update(GroupPart g);

    public MessageResponse listAll(Integer companyId, Integer resaleId);

    public MessageResponse filterBrand(Integer companyId, Integer resaleId, Integer brandId);
}
