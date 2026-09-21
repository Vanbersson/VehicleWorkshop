package com.concierge.apiconcierge.services.parts.group;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.part.group.GroupPart;

import java.util.List;

public interface IGroupPartService {
    public MessageResponse save(GroupPart g);

    public MessageResponse update(GroupPart g);

    public List<GroupPart> listAll(Integer companyId, Integer resaleId);

    public List<GroupPart> filterBrand(Integer companyId, Integer resaleId, Integer brandId);
}
