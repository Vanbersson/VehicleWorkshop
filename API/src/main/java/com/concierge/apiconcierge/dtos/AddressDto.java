package com.concierge.apiconcierge.dtos;

public record AddressDto(
        Integer id,
        String zipCode,
        String state,
        String city,
        String neighborhood,
        String address,
        String addressComplement
) {
}
