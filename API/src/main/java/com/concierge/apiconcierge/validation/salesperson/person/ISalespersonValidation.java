package com.concierge.apiconcierge.validation.salesperson.person;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.salesperson.Salesperson;

public interface ISalespersonValidation {
    MessageResponse save(Salesperson p);

    MessageResponse update(Salesperson p);
}
