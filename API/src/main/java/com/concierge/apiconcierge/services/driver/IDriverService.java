package com.concierge.apiconcierge.services.driver;

import com.concierge.apiconcierge.models.driver.Driver;
import com.concierge.apiconcierge.models.message.MessageResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface IDriverService {
    MessageResponse save(Driver driver);

    MessageResponse update(Driver driver);

    List<Map<String, Object>> listAll(Integer companyId, Integer resaleId);

    MessageResponse filterDriverId(Integer companyId, Integer resaleId, Integer driverId);

    MessageResponse filterDriverCPF(Integer companyId, Integer resaleId, String cpf);

    MessageResponse filterDriverRG(Integer companyId, Integer resaleId, String rg);

    MessageResponse filterDriverName(Integer companyId, Integer resaleId, String name);

    MessageResponse filterDriverCNHRegister(Integer companyId, Integer resaleId, String cnhRegister);

    MessageResponse saveImage(MultipartFile file, String local);

    MessageResponse deleteImage(String local);
}
