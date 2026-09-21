package com.concierge.apiconcierge.validation.clientcompany;

import com.concierge.apiconcierge.models.clientcompany.ClientCompany;
import com.concierge.apiconcierge.models.clientcompany.FisJur;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.repositories.clientcompany.IClientCompanyRepository;
import com.concierge.apiconcierge.util.ConstantsMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ClientCompanyValidation implements IClientCompanyValidation {

    @Autowired
    private IClientCompanyRepository repository;

    @Override
    public MessageResponse save(ClientCompany client) {
        MessageResponse response = new MessageResponse();
        if (client.getCompanyId() == null || client.getCompanyId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (client.getResaleId() == null || client.getResaleId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (client.getStatus() == null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Status");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (client.getName().isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Nome");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (client.getFisjur() == null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("FisJur");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }

        if (client.getFisjur() == FisJur.Física) {
            if (client.getCpf().isBlank()) {
                response.setStatus(ConstantsMessage.ERROR);
                response.setHeader("CPF");
                response.setMessage(ConstantsMessage.NOT_INFORMED);
                return response;
            }
            if(!this.isValidCpf(client.getCpf())){
                response.setStatus(ConstantsMessage.ERROR);
                response.setHeader("CPF");
                response.setMessage("Inválido.");
                return response;
            }
            ClientCompany clientResult = this.repository.filterCPF(client.getCompanyId(), client.getResaleId(), client.getCpf());
            if (clientResult != null) {
                response.setStatus(ConstantsMessage.ERROR);
                response.setHeader("Cliente");
                response.setMessage("Já cadastrado.");
                return response;
            }
        }
        if (client.getFisjur() == FisJur.Jurídica) {
            if (client.getCnpj().isBlank()) {
                response.setStatus(ConstantsMessage.ERROR);
                response.setHeader("CNPJ");
                response.setMessage(ConstantsMessage.NOT_INFORMED);
                return response;
            }
            ClientCompany clientResult = this.repository.filterCNPJ(client.getCompanyId(), client.getResaleId(), client.getCnpj());
            if (clientResult != null) {
                response.setStatus(ConstantsMessage.ERROR);
                response.setHeader("Empresa");
                response.setMessage("Já cadastrada.");
                return response;
            }
        }
        if (client.getClifor() == null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("CliFor");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Informações");
        response.setMessage("Salvo com sucesso.");
        return response;
    }

    @Override
    public MessageResponse update(ClientCompany client) {
        MessageResponse response = new MessageResponse();
        if (client.getCompanyId() == null || client.getCompanyId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (client.getResaleId() == null || client.getResaleId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (client.getId() == null || client.getId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Código");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (client.getStatus() == null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Status");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (client.getName().isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Nome");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (client.getFisjur() == null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("FisJur");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (client.getFisjur() == FisJur.Física) {
            if (client.getCpf().isBlank()) {
                response.setStatus(ConstantsMessage.ERROR);
                response.setHeader("CPF");
                response.setMessage(ConstantsMessage.NOT_INFORMED);
                return response;
            }
            if(!this.isValidCpf(client.getCpf())){
                response.setStatus(ConstantsMessage.ERROR);
                response.setHeader("CPF");
                response.setMessage("Inválido.");
                return response;
            }

            ClientCompany clientFilterCPF = this.repository.filterCPF(client.getCompanyId(), client.getResaleId(), client.getCpf());
            if (clientFilterCPF != null) {
                if(clientFilterCPF.getId() != client.getId()){
                    response.setStatus(ConstantsMessage.ERROR);
                    response.setHeader("Cliente");
                    response.setMessage("Já cadastrado ok.");
                    return response;
                }
            }
        } else if (client.getFisjur() == FisJur.Jurídica) {
            if (client.getCnpj().isBlank()) {
                response.setStatus(ConstantsMessage.ERROR);
                response.setHeader("CNPJ");
                response.setMessage(ConstantsMessage.NOT_INFORMED);
                return response;
            }
        }
        if (client.getClifor() == null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("CliFor");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Informações");
        response.setMessage("Atualizado com sucesso.");
        return response;
    }

    public MessageResponse listAll(Integer companyId, Integer resaleId) {
        MessageResponse response = new MessageResponse();
        if (companyId == null || companyId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (resaleId == null || resaleId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader(ConstantsMessage.SUCCESS);
        response.setMessage(ConstantsMessage.SUCCESS);
        return response;
    }

    @Override
    public MessageResponse filterId(Integer companyId, Integer resaleId, Integer clientId) {
        MessageResponse response = new MessageResponse();
        if (companyId == null || companyId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (resaleId == null || resaleId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (clientId == null || clientId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Código");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader(ConstantsMessage.SUCCESS);
        response.setMessage(ConstantsMessage.SUCCESS);
        return response;
    }

    @Override
    public MessageResponse filterFantasia(Integer companyId, Integer resaleId, String fantasia) {
        MessageResponse response = new MessageResponse();
        if (companyId == null || companyId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (resaleId == null || resaleId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (fantasia.isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Fantasia");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader(ConstantsMessage.SUCCESS);
        response.setMessage(ConstantsMessage.SUCCESS);
        return response;
    }

    @Override
    public MessageResponse filterName(Integer companyId, Integer resaleId, String name) {
        MessageResponse response = new MessageResponse();
        if (companyId == null || companyId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (resaleId == null || resaleId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (name.isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Nome");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader(ConstantsMessage.SUCCESS);
        response.setMessage(ConstantsMessage.SUCCESS);
        return response;
    }

    @Override
    public MessageResponse filterCNPJ(Integer companyId, Integer resaleId, String cnpj) {
        MessageResponse response = new MessageResponse();
        if (companyId == null || companyId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (resaleId == null || resaleId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (cnpj.isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("CNPJ");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader(ConstantsMessage.SUCCESS);
        response.setMessage(ConstantsMessage.SUCCESS);
        return response;
    }

    @Override
    public MessageResponse filterCPF(Integer companyId, Integer resaleId, String cpf) {
        MessageResponse response = new MessageResponse();
        if (companyId == null || companyId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (resaleId == null || resaleId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (cpf.isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("CPF");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader(ConstantsMessage.SUCCESS);
        response.setMessage(ConstantsMessage.SUCCESS);
        return response;
    }

    private boolean isValidCpf(String cpf) {
        if (cpf == null || cpf.length() != 11) {
            return false;
        }

        // Rejeita CPFs com todos os dígitos iguais (ex: 00000000000)
        boolean allSame = true;
        for (int i = 1; i < 11; i++) {
            if (cpf.charAt(i) != cpf.charAt(0)) {
                allSame = false;
                break;
            }
        }
        if (allSame) return false;

        try {
            int soma = 0;
            int peso = 10;

            // Calcula o 1º dígito verificador
            for (int i = 0; i < 9; i++) {
                soma += (cpf.charAt(i) - '0') * peso--;
            }
            int resto = soma % 11;
            int digito1 = (resto < 2) ? 0 : 11 - resto;

            // Valida o 1º dígito
            if (digito1 != (cpf.charAt(9) - '0')) {
                return false;
            }

            soma = 0;
            peso = 11;

            // Calcula o 2º dígito verificador
            for (int i = 0; i < 10; i++) {
                soma += (cpf.charAt(i) - '0') * peso--;
            }
            resto = soma % 11;
            int digito2 = (resto < 2) ? 0 : 11 - resto;

            return digito2 == (cpf.charAt(10) - '0');
        } catch (Exception e) {
            return false;
        }
    }
}
