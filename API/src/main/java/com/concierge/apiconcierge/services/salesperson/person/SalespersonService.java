package com.concierge.apiconcierge.services.salesperson.person;

import com.concierge.apiconcierge.exceptions.ResourcesNotFoundException;
import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.salesperson.Salesperson;
import com.concierge.apiconcierge.models.user.User;
import com.concierge.apiconcierge.repositories.salesperson.ISalespersonRepository;
import com.concierge.apiconcierge.repositories.user.IUserRepository;
import com.concierge.apiconcierge.util.ConstantsMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SalespersonService implements ISalespersonService {

    @Autowired
    private ISalespersonRepository repository;

    @Autowired
    private IUserRepository userRepository;

    @Override
    public MessageResponse save(Salesperson person, String emailUser) {
        User userResult = this.userRepository.loginEmail(emailUser);
        person.setCompanyId(userResult.getCompanyId());
        person.setResaleId(userResult.getResaleId());
        person.setId(null);
        Salesperson saveResult = this.repository.save(person);
        MessageResponse response = new MessageResponse();
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Usuário");
        response.setMessage("Cadastrado com sucesso.");
        response.setData(saveResult);
        return response;
    }

    @Override
    public MessageResponse update(Salesperson person) {
        Salesperson saveResult = this.repository.save(person);
        MessageResponse response = new MessageResponse();
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Usuário");
        response.setMessage("Atualizado com sucesso.");
        response.setData(saveResult);
        return response;
    }

    @Override
    public Salesperson filterId(Integer id, String emailUser) {
        User userResult = this.userRepository.loginEmail(emailUser);
        Salesperson personResult = this.repository.existsByCompanyIdAndResaleIdAndId(userResult.getCompanyId(), userResult.getResaleId(), id);
        if (personResult == null) {
            throw new ResourcesNotFoundException("Vendedor não encontrado.");
        }
        return personResult;
    }

    @Override
    public List<Salesperson> all(String emailUser) {
        User userResult = this.userRepository.loginEmail(emailUser);
        return this.repository.findByCompanyIdAndResaleId(userResult.getCompanyId(), userResult.getResaleId());
    }

    @Override
    public List<Salesperson> allEnabled(String emailUser) {
        User userResult = this.userRepository.loginEmail(emailUser);
        return this.repository.findByCompanyIdAndResaleId(userResult.getCompanyId(), userResult.getResaleId())
                .stream()
                .filter(p -> p.getStatus() == StatusEnableDisable.Habilitado)
                .toList();
    }
}
