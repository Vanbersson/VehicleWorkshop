package com.concierge.apiconcierge.dtos.vehicleEntry;

public record VehicleEntryResponsePlatesDto(
        Integer id,
        String vehiclePlate,
        String modelDescription,
        Integer clientCompanyId,
        String clientCompanyName,
        Integer salespersonId,
        String salespersonName, Integer salespersonUserId) {
}
