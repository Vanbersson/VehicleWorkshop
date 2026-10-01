package com.concierge.apiconcierge.services.clientcompany.region;

import com.concierge.apiconcierge.models.clientcompany.ClientCompanyRegion;
import com.concierge.apiconcierge.models.message.MessageResponse;

import java.util.List;

public interface IClientCompanyRegionService {

    MessageResponse save(ClientCompanyRegion r,String emailUser);

    MessageResponse update(ClientCompanyRegion r);

    List<ClientCompanyRegion> listAll(String emailUser);

    List<ClientCompanyRegion> listAllEnabled(String emailUser);
}
