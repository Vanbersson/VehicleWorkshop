package com.concierge.apiconcierge.validation.clientcompany;

import com.concierge.apiconcierge.models.clientcompany.ClientCompany;
import com.concierge.apiconcierge.models.message.MessageResponse;

import java.util.List;

public interface IClientCompanyValidation {
    public MessageResponse save(ClientCompany client);

    public MessageResponse update(ClientCompany client);

    public MessageResponse listAll(Integer companyId, Integer resaleId);

    public MessageResponse filterId(Integer companyId, Integer resaleId, Integer id);

    public MessageResponse filterFantasia(Integer companyId, Integer resaleId, String fantasia);

    public MessageResponse filterName(Integer companyId, Integer resaleId, String name);

    public MessageResponse filterCNPJ(Integer companyId, Integer resaleId, String cnpj);

    public MessageResponse filterCPF(Integer companyId, Integer resaleId, String cpf);
}
