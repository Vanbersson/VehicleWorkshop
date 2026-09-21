package com.concierge.apiconcierge.services.permission;

import com.concierge.apiconcierge.exceptions.permission.PermissionUserException;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.permission.PermissionUser;
import com.concierge.apiconcierge.models.user.User;
import com.concierge.apiconcierge.models.user.UserRoleEnum;
import com.concierge.apiconcierge.repositories.permission.IPermissionUserRepository;
import com.concierge.apiconcierge.repositories.user.IUserRepository;
import com.concierge.apiconcierge.util.ConstantsMessage;
import com.concierge.apiconcierge.validation.permission.IPermissionUserValidation;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class PermissionUserService implements IPermissionUserService {
    @Autowired
    private IPermissionUserRepository repository;

    @Autowired
    private IPermissionUserValidation validation;

    @Autowired
    private IUserRepository userRepository;

    @SneakyThrows
    @Override
    public MessageResponse save(PermissionUser permission) {
        try {
            MessageResponse response = this.validation.save(permission);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                permission.setId(null);
                this.repository.save(permission);
            }
            return response;
        } catch (Exception ex) {
            throw new PermissionUserException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse update(PermissionUser permission) {
        try {
            MessageResponse response = this.validation.update(permission);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                this.repository.save(permission);
            }
            return response;
        } catch (Exception ex) {
            throw new PermissionUserException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public List<PermissionUser> filterUser(Integer companyId, Integer resaleId, Integer userId) {
        try {
            MessageResponse response = this.validation.filterUser(companyId, resaleId, userId);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                return this.repository.listPermissionUser(companyId, resaleId, userId);
            }
            return List.of();
        } catch (Exception ex) {
            throw new PermissionUserException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse filterPermission(Integer companyId, Integer resaleId, Integer userId, Integer permissionId,String userEmail) {
        try {
            MessageResponse response = this.validation.filterPermission(companyId, resaleId, userId, permissionId);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                User resultUser = this.userRepository.loginEmail(userEmail);
                if(resultUser.getRoleFunc() != UserRoleEnum.ADMIN){
                    PermissionUser result = this.repository.findPermissionId(companyId, resaleId, userId, permissionId);
                    if (result == null) {
                        response.setStatus(ConstantsMessage.ERROR);
                        response.setHeader("Permissão - " + permissionId);
                        response.setMessage(ConstantsMessage.NOT_PERMISSION);
                    }
                }
            }
            return response;
        } catch (Exception ex) {
            throw new PermissionUserException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse deleteAllUser(Integer companyId, Integer resaleId, Integer userId) {
        try {
            MessageResponse response = this.validation.deleteAllUser(companyId, resaleId, userId);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                this.repository.deleteUser(companyId, resaleId, userId);
            }
            return response;
        } catch (Exception ex) {
            throw new PermissionUserException(ex.getMessage());
        }
    }
}
