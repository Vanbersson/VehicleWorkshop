package com.concierge.apiconcierge.services.permission;

import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.permission.PermissionUser;

import java.util.List;

public interface IPermissionUserService {

    MessageResponse save(PermissionUser permission);

    MessageResponse update(PermissionUser permission);

    List<PermissionUser> filterUser(Integer companyId, Integer resaleId, Integer userId);

    MessageResponse filterPermission(Integer companyId, Integer resaleId, Integer userId, Integer permissionId,String userEmail);

    MessageResponse deleteAllUser(Integer companyId, Integer resaleId, Integer userId);

}
