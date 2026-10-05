package com.concierge.apiconcierge.validation.salesperson.group;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.salesperson.SalespersonGroup;

public interface ISalespersonGroupValidation {
    MessageResponse save(SalespersonGroup g);

    MessageResponse update(SalespersonGroup g);
}
