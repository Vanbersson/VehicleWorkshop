package com.concierge.apiconcierge.dtos.permission;

import java.util.UUID;

public record PermissionUserDto(
        Integer companyId,
        Integer resaleId,
        UUID id,
        Integer userId,
        Integer permissionId) {
}
