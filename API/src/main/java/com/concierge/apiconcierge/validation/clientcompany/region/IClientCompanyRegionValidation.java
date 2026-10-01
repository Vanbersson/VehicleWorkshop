package com.concierge.apiconcierge.validation.clientcompany.region;

import com.concierge.apiconcierge.models.clientcompany.ClientCompanyRegion;
import com.concierge.apiconcierge.models.message.MessageResponse;

public interface IClientCompanyRegionValidation {

    MessageResponse save(ClientCompanyRegion r);

    MessageResponse update(ClientCompanyRegion r);
}
