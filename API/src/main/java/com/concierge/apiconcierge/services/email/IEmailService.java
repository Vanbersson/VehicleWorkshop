package com.concierge.apiconcierge.services.email;

import com.concierge.apiconcierge.dtos.email.EmailDto;

public interface IEmailService {
    public String send(EmailDto email);
}
