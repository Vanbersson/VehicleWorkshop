package com.concierge.apiconcierge.dtos.vehicle.entry;

public record ExistsVehiclePlateDto(
        Integer companyId,
        Integer resaleId,
        String vehiclePlate
) {
}
