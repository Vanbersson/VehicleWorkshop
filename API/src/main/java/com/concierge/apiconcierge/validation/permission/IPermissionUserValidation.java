package com.concierge.apiconcierge.validation.permission;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.permission.PermissionUser;
import com.concierge.apiconcierge.services.permission.PermissionUserService;

public interface IPermissionUserValidation {
    MessageResponse save(PermissionUser permission);

    MessageResponse update(PermissionUser permission);

    MessageResponse filterUser(Integer companyId, Integer resaleId,Integer userId);

    MessageResponse filterPermission(Integer companyId, Integer resaleId, Integer userId, Integer permissionId);

    MessageResponse deleteAllUser(Integer companyId, Integer resaleId,Integer userId);
}
