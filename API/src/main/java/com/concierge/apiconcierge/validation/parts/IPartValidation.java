package com.concierge.apiconcierge.validation.parts;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.part.Part;

import java.util.List;

public interface IPartValidation {

    public MessageResponse save(Part part);

    public MessageResponse update(Part part);

    public MessageResponse listAll(Integer companyId, Integer resaleId);

    public MessageResponse filterId(Integer companyId, Integer resaleId, Integer id);

    public MessageResponse filterCode(Integer companyId, Integer resaleId, String code);

    public MessageResponse filterDesc(Integer companyId, Integer resaleId, String desc);
}
