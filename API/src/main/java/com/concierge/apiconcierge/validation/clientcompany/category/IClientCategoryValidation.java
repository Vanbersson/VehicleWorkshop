package com.concierge.apiconcierge.validation.clientcompany.category;

import com.concierge.apiconcierge.models.clientcompany.ClientCategory;
import com.concierge.apiconcierge.models.message.MessageResponse;

public interface IClientCategoryValidation {
    public MessageResponse save(ClientCategory cat);

    public MessageResponse update(ClientCategory cat);

    public MessageResponse listAll(Integer companyId, Integer resaleId);

    public MessageResponse filterId(Integer companyId, Integer resaleId, Integer id);
}
