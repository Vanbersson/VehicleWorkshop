package com.concierge.apiconcierge.validation.driver;

import com.concierge.apiconcierge.models.driver.Driver;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.repositories.driver.IDriverRepository;
import com.concierge.apiconcierge.util.ConstantsMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DriverValidation implements IDriverValidation {

    @Autowired
    IDriverRepository repository;

    @Override
    public MessageResponse save(Driver driver) {
        MessageResponse response = new MessageResponse();
        if (driver.getCompanyId() == null || driver.getCompanyId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (driver.getResaleId() == null || driver.getResaleId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (driver.getStatus() == null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Status");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (driver.getName().isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Nome");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (driver.getCpf().isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("CPF");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        boolean isValidCpf = this.isValidCpf(driver.getCpf());
        if (!isValidCpf) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("CPF");
            response.setMessage("CPF inválido");
            return response;
        }
        Driver result = this.repository.filterCPF(driver.getCompanyId(), driver.getResaleId(), driver.getCpf());
        if (result != null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Motorista");
            response.setMessage("Já cadastrado.");
            return response;
        }
        if (driver.getRg().isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("RG");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Motorista");
        response.setMessage("Cadastrado com sucesso.");
        return response;
    }

    @Override
    public MessageResponse update(Driver driver) {
        MessageResponse response = new MessageResponse();
        if (driver.getCompanyId() == null || driver.getCompanyId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (driver.getResaleId() == null || driver.getResaleId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (driver.getId() == null || driver.getId() == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Código");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (driver.getStatus() == null) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Status");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (driver.getName().isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Nome");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (driver.getCpf().isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("CPF");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        boolean isValidCpf = this.isValidCpf(driver.getCpf());
        if (!isValidCpf) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("CPF");
            response.setMessage("CPF inválido");
            return response;
        }
        if (driver.getRg().isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("RG");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        Driver result = this.repository.filterCPF(driver.getCompanyId(), driver.getResaleId(), driver.getCpf());
        if (result.getId() != driver.getId()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Motorista já cadastrado.");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Motorista");
        response.setMessage("Atualizado com sucesso.");
        return response;
    }

    @Override
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
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Motoristas");
        response.setMessage("Encontrados com sucesso.");
        return response;
    }

    @Override
    public MessageResponse filterDriverId(Integer companyId, Integer resaleId, Integer driverId) {
        MessageResponse response = new MessageResponse();
        if (companyId == null || companyId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (resaleId == null || resaleId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (driverId == null || driverId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Código");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Motorista");
        response.setMessage("Encontrado com sucesso.");
        return response;
    }

    @Override
    public MessageResponse filterDriverCPF(Integer companyId, Integer resaleId, String cpf) {
        MessageResponse response = new MessageResponse();
        if (companyId == null || companyId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (resaleId == null || resaleId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
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
        response.setHeader("Motorista");
        response.setMessage("Encontrado com sucesso.");
        return response;
    }

    @Override
    public MessageResponse filterDriverRG(Integer companyId, Integer resaleId, String rg) {
        MessageResponse response = new MessageResponse();
        if (companyId == null || companyId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (resaleId == null || resaleId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (rg.isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("RG");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Motorista");
        response.setMessage("Encontrado com sucesso.");
        return response;
    }

    @Override
    public MessageResponse filterDriverName(Integer companyId, Integer resaleId, String name) {
        MessageResponse response = new MessageResponse();
        if (companyId == null || companyId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (resaleId == null || resaleId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
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
        response.setHeader("Motorista");
        response.setMessage("Encontrado com sucesso.");
        return response;
    }

    @Override
    public MessageResponse filterDriverCNHRegister(Integer companyId, Integer resaleId, String cnhRegister) {
        MessageResponse response = new MessageResponse();
        if (companyId == null || companyId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (resaleId == null || resaleId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (cnhRegister.isBlank()) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Número CNH");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Motorista");
        response.setMessage("Encontrado com sucesso.");
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
