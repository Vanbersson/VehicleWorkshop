package com.concierge.apiconcierge.validation.user;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.user.User;

import java.util.List;
import java.util.Map;

public interface IUserValidation {
    MessageResponse save(User user);

    MessageResponse update(User user);

    MessageResponse listAll(Integer companyId, Integer resaleId);

    MessageResponse filterId(Integer companyId, Integer resaleId, Integer id);

    MessageResponse filterRoleId(Integer companyId, Integer resaleId, Integer roleId);

    MessageResponse filterEmail(Integer companyId, Integer resaleId, String email);

}
