package com.concierge.apiconcierge.services.workshop.mechanic;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.workshop.mechanic.Mechanic;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface IMechanicService {

    MessageResponse save(Mechanic mec);

    MessageResponse update(Mechanic mec);

    List<Mechanic> listAll(Integer companyId, Integer resaleId);

    List<Mechanic> listAllEnabled(Integer companyId, Integer resaleId);

    MessageResponse filterCodePass(Mechanic mec);

    MessageResponse filterId(Integer companyId, Integer resaleId, Integer id);

    MessageResponse savePhoto(MultipartFile file, String local);

    MessageResponse deletePhoto(String local);
}
