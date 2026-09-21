package com.concierge.apiconcierge.dtos.permission;

public record PermissionUserSaveDto(
        Integer companyId,
        Integer resaleId,
        Integer userId,
        Integer permissionId) {
}
