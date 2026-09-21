package com.concierge.apiconcierge.dtos.email;

public record EmailDto(String from,String[] to,String subject, String body) {
}
