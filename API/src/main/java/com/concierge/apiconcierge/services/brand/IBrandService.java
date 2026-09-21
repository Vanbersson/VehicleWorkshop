package com.concierge.apiconcierge.services.brand;

import com.concierge.apiconcierge.models.brand.Brand;
import com.concierge.apiconcierge.models.message.MessageResponse;

import java.util.List;

public interface IBrandService {
    public MessageResponse save(Brand b);

    public MessageResponse update(Brand b, String userEmail);

    public List<Brand> listAll();

    public List<Brand> listAllEnabled();

}
