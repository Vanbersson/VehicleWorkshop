package com.concierge.apiconcierge.validation.driver;

import com.concierge.apiconcierge.models.driver.Driver;
import com.concierge.apiconcierge.models.message.MessageResponse;

import java.util.Map;

public interface IDriverValidation {

    public MessageResponse save(Driver driver);

    public MessageResponse update(Driver driver);

    public MessageResponse listAll(Integer companyId, Integer resaleId);

    public MessageResponse filterDriverId(Integer companyId, Integer resaleId, Integer driverId);

    public MessageResponse filterDriverCPF(Integer companyId, Integer resaleId, String cpf);

    public MessageResponse filterDriverRG(Integer companyId, Integer resaleId, String rg);

    public MessageResponse filterDriverName(Integer companyId, Integer resaleId, String name);

    public MessageResponse filterDriverCNHRegister(Integer companyId, Integer resaleId, String cnhRegister);
}
