package com.concierge.apiconcierge.services.parts;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.part.Part;
import com.concierge.apiconcierge.services.parts.interfaces.IPartListAll;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

public interface IPartService {

    public MessageResponse save(Part part);

    public MessageResponse update(Part part);

    public List<Map<String, Object>> listAll(Integer companyId, Integer resaleId);

    public MessageResponse filterId(Integer companyId, Integer resaleId, Integer id);

    public MessageResponse filterCode(Integer companyId, Integer resaleId, String code);

    public MessageResponse filterDesc(Integer companyId, Integer resaleId, String desc);

    public MessageResponse saveImage(MultipartFile file, String local);

    public MessageResponse deleteImage(String local);

}
