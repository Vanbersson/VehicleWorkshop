package com.concierge.apiconcierge.services.parts.unit;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.part.unit.UnitMeasure;

import java.util.List;

public interface IUnitMeasureService {
    public MessageResponse save(UnitMeasure un);

    public MessageResponse update(UnitMeasure un);

    public List<UnitMeasure> listAll();

    public List<UnitMeasure> listAllEnabled();
}
