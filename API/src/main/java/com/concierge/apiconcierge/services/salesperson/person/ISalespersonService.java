package com.concierge.apiconcierge.services.salesperson.person;

import com.concierge.apiconcierge.dtos.salesperson.ResponseSalespersonDto;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.salesperson.Salesperson;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface ISalespersonService {
    MessageResponse save(Salesperson person, String emailUser);

    MessageResponse update(Salesperson person);

    Salesperson filterId(Integer id, String emailUser);

    List<ResponseSalespersonDto> all(String emailUser);

    List<Salesperson> allEnabled(String emailUser);

    Map<String, String> saveImage(MultipartFile file, String local, String emailUser);
}
