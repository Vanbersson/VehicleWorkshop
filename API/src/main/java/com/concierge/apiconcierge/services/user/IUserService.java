package com.concierge.apiconcierge.services.user;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.user.User;
import org.springframework.web.multipart.MultipartFile;

public interface IUserService {

    MessageResponse save(User user);

    MessageResponse update(User user);

    MessageResponse updatePass(Integer companyId, Integer resaleId, Integer id, String pass);

    MessageResponse listAll(Integer companyId, Integer resaleId);

    MessageResponse listAllEnabled(String emailUser);

    MessageResponse filterId(Integer companyId, Integer resaleId, Integer id);

    MessageResponse filterRoleId(Integer companyId, Integer resaleId, Integer roleId);

    MessageResponse filterEmail(Integer companyId, Integer resaleId, String email);

    MessageResponse saveImage(MultipartFile file, String local);

    MessageResponse deleteImage(String local);
}
