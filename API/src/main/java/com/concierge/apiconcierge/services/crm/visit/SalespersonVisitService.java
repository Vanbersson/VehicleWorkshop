package com.concierge.apiconcierge.services.crm.visit;

import com.concierge.apiconcierge.dtos.crm.agenda.SalespersonVisitAgendaNewDto;
import com.concierge.apiconcierge.dtos.crm.agenda.SalespersonVisitAgendaResponseDto;
import com.concierge.apiconcierge.dtos.crm.agenda.SalespersonVisitAgendaUpdateDto;
import com.concierge.apiconcierge.dtos.crm.visit.SalespersonVisitResponseDto;
import com.concierge.apiconcierge.exceptions.BusinessException;
import com.concierge.apiconcierge.exceptions.ResourcesNotFoundException;
import com.concierge.apiconcierge.models.crm.visit.SalespersonVisit;
import com.concierge.apiconcierge.models.crm.visit.StatusVisitEnum;
import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.permission.PermissionUser;
import com.concierge.apiconcierge.models.salesperson.Salesperson;
import com.concierge.apiconcierge.models.user.User;
import com.concierge.apiconcierge.models.user.UserRoleEnum;
import com.concierge.apiconcierge.repositories.crm.visit.ISalespersonVisitRepository;
import com.concierge.apiconcierge.repositories.permission.IPermissionUserRepository;
import com.concierge.apiconcierge.repositories.salesperson.ISalespersonRepository;
import com.concierge.apiconcierge.repositories.user.IUserRepository;
import com.concierge.apiconcierge.util.ConstantsMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

import static com.concierge.apiconcierge.util.ConstantsPermission.LIST_AGENDA_ALL_SALESPERSON;
import static com.concierge.apiconcierge.util.ConstantsPermission.LIST_VISIT_ALL_SALESPERSON;

@Service
public class SalespersonVisitService implements ISalespersonVisitService {

    @Autowired
    private ISalespersonVisitRepository repository;

    @Autowired
    private IUserRepository userRepository;

    @Autowired
    private ISalespersonRepository salespersonRepository;

    @Autowired
    private IPermissionUserRepository permissionUser;

    @Override
    public SalespersonVisit registerNew(SalespersonVisit v, String emailUser) {
        User userResult = this.userRepository.loginEmail(emailUser);
        if (userResult.getStatus() == StatusEnableDisable.Desabilitado) {
            throw new BusinessException("Usuário Bloqueado.");
        }
        v.setCompanyId(userResult.getCompanyId());
        v.setResaleId(userResult.getResaleId());
        v.setStatus(StatusVisitEnum.iniciou);
        v.setDateRegister(new Date());
        v.setUserIdRegister(userResult.getId());
        v.setUserNameRegister(userResult.getName());
        return this.repository.save(v);
    }

    @Override
    public SalespersonVisit registerUpdate(SalespersonVisit v, String emailUser) {
        User userResult = this.userRepository.loginEmail(emailUser);
        if (userResult.getStatus() == StatusEnableDisable.Desabilitado) {
            throw new BusinessException("Usuário Bloqueado.");
        }
        return this.repository.save(v);
    }

    @Override
    public SalespersonVisit filterVisit(Integer id, String emailUser) {
        User userResult = this.userRepository.loginEmail(emailUser);
        if (userResult.getStatus() == StatusEnableDisable.Desabilitado) {
            throw new BusinessException("Usuário Bloqueado.");
        }
        SalespersonVisit resultVisit = this.repository.findByCompanyIdAndResaleIdAndId(userResult.getCompanyId(), userResult.getResaleId(), id);
        if (resultVisit == null) {
            throw new ResourcesNotFoundException("Visita não encontrada.");
        }
        return resultVisit;
    }

    @Override
    public MessageResponse agendaNew(SalespersonVisitAgendaNewDto v, String emailUser) {
        User userResult = this.userRepository.loginEmail(emailUser);
        if (userResult.getStatus() == StatusEnableDisable.Desabilitado) {
            throw new BusinessException("Usuário Bloqueado.");
        }
        return null;
    }

    @Override
    public MessageResponse agendaUpdate(SalespersonVisitAgendaUpdateDto v, String emailUser) {
        User userResult = this.userRepository.loginEmail(emailUser);
        if (userResult.getStatus() == StatusEnableDisable.Desabilitado) {
            throw new BusinessException("Usuário Bloqueado.");
        }
        return null;
    }

    @Override
    public List<SalespersonVisitResponseDto> listAll(String emailUser) {
        User userResult = this.userRepository.loginEmail(emailUser);
        if (userResult.getStatus() == StatusEnableDisable.Desabilitado) {
            throw new BusinessException("Usuário Bloqueado.");
        }
        Salesperson salespersonResult = this.salespersonRepository.findByCompanyIdAndResaleIdAndUserId(userResult.getCompanyId(), userResult.getResaleId(), userResult.getId());
        if (salespersonResult == null) {
            throw new BusinessException("Vendedor Não encontrado.");
        }
        if (salespersonResult.getStatus() == StatusEnableDisable.Desabilitado) {
            throw new BusinessException("Vendedor Bloqueado.");
        }
        //Permissão para listar todos os vendedores
        PermissionUser permission = this.permissionUser.findPermissionId(userResult.getCompanyId(), userResult.getResaleId(), userResult.getId(), LIST_VISIT_ALL_SALESPERSON);
        //Lista visitas de todos os vendedores
        if (permission != null) {
            return this.repository.findAll()
                    .stream()
                    .filter(v -> v.getStatus() == StatusVisitEnum.agendado
                            || v.getStatus() == StatusVisitEnum.iniciou)
                    .map(v -> new SalespersonVisitResponseDto(v.getId(), v.getSalespersonName(), v.getStatus(), v.getDateRegister(), v.getDateVisit(), v.getClientName()))
                    .toList();
        } else {
            //Lista visitas do usuário logado
            return this.repository.findAll()
                    .stream()
                    .filter(v -> v.getSalespersonId() == salespersonResult.getId())
                    .filter(v -> v.getStatus() == StatusVisitEnum.agendado
                            || v.getStatus() == StatusVisitEnum.iniciou)
                    .map(v -> new SalespersonVisitResponseDto(v.getId(), v.getSalespersonName(), v.getStatus(), v.getDateRegister(), v.getDateVisit(), v.getClientName()))
                    .toList();
        }
    }

    @Override
    public List<SalespersonVisitAgendaResponseDto> listAllAgenda(String emailUser) {
        User userResult = this.userRepository.loginEmail(emailUser);
        if (userResult.getStatus() == StatusEnableDisable.Desabilitado) {
            throw new BusinessException("Usuário Bloqueado.");
        }
        Salesperson salespersonResult = this.salespersonRepository.findByCompanyIdAndResaleIdAndUserId(userResult.getCompanyId(), userResult.getResaleId(), userResult.getId());
        if (salespersonResult == null) {
            throw new BusinessException("Vendedor Não encontrado.");
        }
        if (salespersonResult.getStatus() == StatusEnableDisable.Desabilitado) {
            throw new BusinessException("Vendedor Bloqueado.");
        }
        //Permissão para listar todos os vendedores
        PermissionUser permission = this.permissionUser.findPermissionId(userResult.getCompanyId(), userResult.getResaleId(), userResult.getId(), LIST_AGENDA_ALL_SALESPERSON);
        //Lista visitas de todos os vendedores
//        if (permission != null) {
//            return this.repository.findAll()
//                    .stream()
//                    .map(v -> new SalespersonVisitAgendaUpdateDto(v.getId(), v.getSalespersonName()))
//                    .toList();
//        } else {
//            //Lista visitas do usuário logado
//            return this.repository.findAll()
//                    .stream()
//                    .filter(v -> v.getSalespersonId() == salespersonResult.getId() && v.getStatus() == StatusVisitEnum.agendado )
//                    .map(v -> new SalespersonVisitAgendaUpdateDto(v.getId(), v.getSalespersonName(), v.getStatus(), v.getDateRegister(), v.getDateVisit(), v.getClientName()))
//                    .toList();
//        }

        return List.of();
    }


}
