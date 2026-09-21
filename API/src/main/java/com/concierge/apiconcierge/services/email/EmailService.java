package com.concierge.apiconcierge.services.email;

import com.concierge.apiconcierge.dtos.email.EmailDto;
import com.concierge.apiconcierge.exceptions.email.EmailException;
import com.concierge.apiconcierge.util.ConstantsMessage;
import jakarta.mail.internet.MimeMessage;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService implements IEmailService {

    @Autowired
    JavaMailSender mailSender;

    @SneakyThrows
    @Override
    public String send(EmailDto email) {
        try {

            if (email.from().isBlank())
                throw new EmailException();
            if (email.to().length == 0)
                throw new EmailException();
            if (email.subject().isBlank())
                throw new EmailException();
            if (email.body().isBlank())
                throw new EmailException();


            MimeMessage message = this.mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(email.from());
            helper.setTo(email.to());
            helper.setSubject(email.subject());
            helper.setText(email.body(), true);

            this.mailSender.send(message);

            return ConstantsMessage.SUCCESS;
        } catch (Exception ex) {
            throw new EmailException(ex.getMessage());
        }
    }
}
