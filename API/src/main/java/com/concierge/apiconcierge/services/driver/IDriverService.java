package com.concierge.apiconcierge.services.driver;

import com.concierge.apiconcierge.models.driver.Driver;
import com.concierge.apiconcierge.models.message.MessageResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface IDriverService {
    public MessageResponse save(Driver driver);

    public MessageResponse update(Driver driver);

    public MessageResponse listAll(Integer companyId, Integer resaleId);

    public MessageResponse filterDriverId(Integer companyId, Integer resaleId, Integer driverId);

    public MessageResponse filterDriverCPF(Integer companyId, Integer resaleId, String cpf);

    public MessageResponse filterDriverRG(Integer companyId, Integer resaleId, String rg);

    public MessageResponse filterDriverName(Integer companyId, Integer resaleId, String name);

    public MessageResponse filterDriverCNHRegister(Integer companyId, Integer resaleId, String cnhRegister);

    public MessageResponse savePhotoDriver(MultipartFile file, String driverId, String companyId, String resaleId);

    public MessageResponse savePhotoDoc1(MultipartFile file, String driverId, String companyId, String resaleId);

    public MessageResponse savePhotoDoc2(MultipartFile file, String driverId, String companyId, String resaleId);

    public MessageResponse deletePhoto(String driverId, String code, String companyId, String resaleId);
}
