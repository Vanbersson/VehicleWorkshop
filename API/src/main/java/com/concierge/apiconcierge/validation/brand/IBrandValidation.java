package com.concierge.apiconcierge.validation.brand;

import com.concierge.apiconcierge.models.brand.Brand;
import com.concierge.apiconcierge.models.message.MessageResponse;

public interface IBrandValidation {

    public MessageResponse save(Brand b);

    public MessageResponse update(Brand b, String userEmail);

}
