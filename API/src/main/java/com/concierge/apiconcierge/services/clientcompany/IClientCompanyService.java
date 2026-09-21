package com.concierge.apiconcierge.services.clientcompany;

import com.concierge.apiconcierge.models.clientcompany.ClientCompany;
import com.concierge.apiconcierge.models.message.MessageResponse;

public interface IClientCompanyService {

    public MessageResponse save(ClientCompany client);

    public MessageResponse update(ClientCompany client);

    public MessageResponse listAll(Integer companyId, Integer resaleId);

    public MessageResponse filterId(Integer companyId, Integer resaleId, Integer clientId);

    public MessageResponse filterJFantasia(Integer companyId, Integer resaleId, String fantasia);

    public MessageResponse filterFFantasia(Integer companyId, Integer resaleId, String fantasia);

    public MessageResponse filterJNome(Integer companyId, Integer resaleId, String name);

    public MessageResponse filterFNome(Integer companyId, Integer resaleId, String name);

    public MessageResponse filterCNPJ(Integer companyId, Integer resaleId, String cnpj);

    public MessageResponse filterCPF(Integer companyId, Integer resaleId, String cpf);
}
