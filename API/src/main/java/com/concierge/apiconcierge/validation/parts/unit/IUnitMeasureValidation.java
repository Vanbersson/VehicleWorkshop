package com.concierge.apiconcierge.validation.parts.unit;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.part.unit.UnitMeasure;

public interface IUnitMeasureValidation {
    public MessageResponse save(UnitMeasure un);

    public MessageResponse update(UnitMeasure un);
}
