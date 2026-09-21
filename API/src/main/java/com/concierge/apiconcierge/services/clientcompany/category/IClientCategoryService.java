package com.concierge.apiconcierge.services.clientcompany.category;

import com.concierge.apiconcierge.models.clientcompany.ClientCategory;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.enums.StatusEnableDisable;

public interface IClientCategoryService {
    public MessageResponse save(ClientCategory cat);

    public MessageResponse update(ClientCategory cat);

    public MessageResponse listAll(Integer companyId, Integer resaleId);

    public MessageResponse listAllStatus(Integer companyId, Integer resaleId, StatusEnableDisable status);

    public MessageResponse filterId(Integer companyId, Integer resaleId, Integer id);

}
