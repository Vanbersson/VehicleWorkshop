package com.concierge.apiconcierge.services.workshop.toolcontrol.material;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.workshop.toolcontrol.ToolControlMaterial;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface IToolControlMaterialService {
    MessageResponse save(ToolControlMaterial mat);

    MessageResponse update(ToolControlMaterial mat);

    MessageResponse filterId(Integer companyId, Integer resaleId, Integer id);

    List<Map<String, Object>> listAll(Integer companyId, Integer resaleId);

    List<Map<String, Object>> listAllEnabled(Integer companyId, Integer resaleId);

    MessageResponse saveImage(MultipartFile file, String local);

    MessageResponse deleteImage(String local);
}
