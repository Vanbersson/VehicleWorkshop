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

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.Objects;

import static com.concierge.apiconcierge.util.ConstantsPermission.CREATE_AGENDA_ALL_SALESPERSON;
import static com.concierge.apiconcierge.util.ConstantsPermission.REGISTER_VISIT_ALL_SALESPERSON;
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
        Salesperson assigned = authorizeAssignment(userResult, v.getSalespersonId(), REGISTER_VISIT_ALL_SALESPERSON);
        v.setSalespersonName(assigned.getName());
        v.setCompanyId(userResult.getCompanyId());
        v.setResaleId(userResult.getResaleId());
        v.setStatus(StatusVisitEnum.iniciou);
        v.setDateRegister(new Date());
        v.setUserIdRegister(userResult.getId());
        v.setUserNameRegister(userResult.getName());
        return this.repository.save(v);
    }

    @Autowired
    private com.concierge.apiconcierge.services.crm.attendance.CustomerAttendanceService attendanceService;

    @Override
    @org.springframework.transaction.annotation.Transactional
    public SalespersonVisit registerUpdate(SalespersonVisit v, String emailUser) {
        User userResult = this.userRepository.loginEmail(emailUser);
        if (userResult.getStatus() == StatusEnableDisable.Desabilitado) {
            throw new BusinessException("Usuário Bloqueado.");
        }
        SalespersonVisit existing = this.repository.findForCompletion(userResult.getCompanyId(), userResult.getResaleId(), v.getId());
        if (existing == null) throw new ResourcesNotFoundException("Visita não encontrada.");
        authorizeAssignment(userResult, existing.getSalespersonId(), REGISTER_VISIT_ALL_SALESPERSON);
        Salesperson assigned = authorizeAssignment(userResult, v.getSalespersonId(), REGISTER_VISIT_ALL_SALESPERSON);
        v.setSalespersonName(assigned.getName());
        // Keep the original registration metadata and scope, regardless of request values.
        v.setCompanyId(existing.getCompanyId());
        v.setResaleId(existing.getResaleId());
        v.setDateRegister(existing.getDateRegister());
        v.setUserIdRegister(existing.getUserIdRegister());
        v.setUserNameRegister(existing.getUserNameRegister());
        SalespersonVisit saved = this.repository.save(v);
        if (saved.getStatus() == StatusVisitEnum.concluído) attendanceService.createForVisit(saved);
        return saved;
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

        Salesperson assigned = authorizeAssignment(userResult, v.salespersonId(), CREATE_AGENDA_ALL_SALESPERSON);
        SalespersonVisit visit = new SalespersonVisit();
        visit.setCompanyId(userResult.getCompanyId());
        visit.setResaleId(userResult.getResaleId());

        visit.setStatus(StatusVisitEnum.agendado);
        visit.setDateRegister(new Date());

        visit.setUserIdRegister(userResult.getId());
        visit.setUserNameRegister(userResult.getName());

        visit.setSalespersonId(v.salespersonId());
        visit.setSalespersonName(assigned.getName());

        visit.setClientId(v.clientId());
        visit.setClientName(v.clientName());
        visit.setClientCNPJ(v.clientCNPJ());
        visit.setClientCPF(v.clientCPF());

        visit.setAgendaDate(v.dateVisit());
        visit.setAgendaInfo(v.informationAgenda());

        this.repository.save(visit);

        MessageResponse response = new MessageResponse();
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader(ConstantsMessage.SUCCESS);
        return response;

    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public MessageResponse agendaUpdate(SalespersonVisitAgendaUpdateDto v, String emailUser) {
        User user = this.userRepository.loginEmail(emailUser);
        if (user == null || user.getStatus() == StatusEnableDisable.Desabilitado) throw new BusinessException("Usuário bloqueado.");
        SalespersonVisit visit = this.repository.findForCompletion(user.getCompanyId(), user.getResaleId(), v.id());
        if (visit == null) throw new ResourcesNotFoundException("Visita não encontrada.");
        if (visit.getStatus() != StatusVisitEnum.agendado) throw new BusinessException("Somente visitas agendadas podem ter o agendamento alterado.");
        authorizeAssignment(user, visit.getSalespersonId(), CREATE_AGENDA_ALL_SALESPERSON);
        Salesperson assigned = authorizeAssignment(user, v.salespersonId(), CREATE_AGENDA_ALL_SALESPERSON);
        visit.setAgendaDate(v.dateVisit());
        visit.setAgendaInfo(v.informationAgenda() == null ? "" : v.informationAgenda().trim());
        visit.setSalespersonId(assigned.getId());
        visit.setSalespersonName(assigned.getName());
        visit.setClientId(v.clientId());
        visit.setClientName(v.clientName());
        visit.setClientCNPJ(v.clientCNPJ());
        visit.setClientCPF(v.clientCPF());
        this.repository.save(visit);
        MessageResponse response = new MessageResponse();
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader(ConstantsMessage.SUCCESS);
        return response;
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
                    .map(v -> new SalespersonVisitResponseDto(v.getId(), v.getSalespersonName(), v.getStatus(), v.getDateRegister(), v.getDateVisit(), v.getAgendaDate(), v.getClientName()))
                    .toList();
        } else {
            //Lista visitas do usuário logado
            return this.repository.findAll()
                    .stream()
                    .filter(v -> v.getSalespersonId() == salespersonResult.getId())
                    .filter(v -> v.getStatus() == StatusVisitEnum.agendado
                            || v.getStatus() == StatusVisitEnum.iniciou)
                    .map(v -> new SalespersonVisitResponseDto(v.getId(), v.getSalespersonName(), v.getStatus(), v.getDateRegister(), v.getDateVisit(), v.getAgendaDate(), v.getClientName()))
                    .toList();
        }
    }

    @Override
    public List<SalespersonVisitAgendaResponseDto> listOverdueAgenda(String emailUser) {
        User user = this.userRepository.loginEmail(emailUser);
        if (user.getStatus() == StatusEnableDisable.Desabilitado) {
            throw new BusinessException("Usuário Bloqueado.");
        }
        Salesperson salesperson = this.salespersonRepository.findByCompanyIdAndResaleIdAndUserId(user.getCompanyId(), user.getResaleId(), user.getId());
        if (salesperson == null) {
            throw new ResourcesNotFoundException("Vendedor Não encontrado.");
        }
        if (salesperson.getStatus() == StatusEnableDisable.Desabilitado) {
            throw new BusinessException("Vendedor Bloqueado.");
        }
        PermissionUser permission = this.permissionUser.findPermissionId(user.getCompanyId(), user.getResaleId(), user.getId(), LIST_AGENDA_ALL_SALESPERSON);
        Date now = new Date();
        return this.repository.findAll().stream()
                .filter(v -> Objects.equals(v.getCompanyId(), user.getCompanyId()) && Objects.equals(v.getResaleId(), user.getResaleId()))
                .filter(v -> permission != null || Objects.equals(v.getSalespersonId(), salesperson.getId()))
                .filter(v -> v.getStatus() == StatusVisitEnum.agendado)
                .filter(v -> v.getAgendaDate() != null && v.getAgendaDate().before(now))
                .sorted(java.util.Comparator.comparing(SalespersonVisit::getAgendaDate))
                .map(v -> new SalespersonVisitAgendaResponseDto(v.getId(), v.getAgendaDate(), v.getSalespersonId(), v.getSalespersonName(), v.getClientId(), v.getClientName(), v.getClientCNPJ(), v.getClientCPF(), v.getAgendaInfo()))
                .toList();
    }

    @Override
    public List<SalespersonVisitAgendaResponseDto> listAllAgenda(String day, String emailUser) {
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
        if (day == null) {
            throw new BusinessException("Informe o dia da agenda.");
        }
        //Permissão para listar todos os vendedores
        PermissionUser permission = this.permissionUser.findPermissionId(userResult.getCompanyId(), userResult.getResaleId(), userResult.getId(), LIST_AGENDA_ALL_SALESPERSON);

        // Use o fuso definido para a agenda da aplicação.
        ZoneId zone = ZoneId.of("America/Sao_Paulo");

        LocalDate data = LocalDate.parse(day);

        Date inicio = Date.from(data.atStartOfDay(zone).toInstant());
        Date fim = Date.from(data.plusDays(1).atStartOfDay(zone).toInstant());

        return this.repository.findAll()
                .stream()
                // Ajuste os getters conforme os campos da sua entidade.
                .filter(v ->
                        Objects.equals(v.getCompanyId(), userResult.getCompanyId())
                                && Objects.equals(v.getResaleId(), userResult.getResaleId())
                )
                // Com permissão, lista todos; sem permissão, somente o vendedor.
                .filter(v -> permission != null || Objects.equals(v.getSalespersonId(), salespersonResult.getId())
                )
                .filter(v -> v.getStatus() == StatusVisitEnum.agendado)
                .filter(v -> {
                    Date agenda = v.getAgendaDate();
                    return agenda != null
                            && !agenda.before(inicio)
                            && agenda.before(fim);
                })
                .map(v -> new SalespersonVisitAgendaResponseDto(
                        v.getId(),
                        v.getAgendaDate(),
                        v.getSalespersonId(),
                        v.getSalespersonName(),
                        v.getClientId(),
                        v.getClientName(),
                        v.getClientCNPJ(),
                        v.getClientCPF(),
                        v.getAgendaInfo()
                ))
                .toList();

        //////////////////////
        //Lista visitas de todos os vendedores
//        if (permission != null) {
//            return this.repository.findAll()
//                    .stream()
//                    .filter(v -> v.getSalespersonId() == salespersonResult.getId() && v.getStatus() == StatusVisitEnum.agendado)
//                    .filter(v -> {
//                        Date agenda = v.getAgendaDate();
//
//                        return agenda != null
//                                && !agenda.before(inicio)
//                                && agenda.before(fim);
//                    })
//                    .map(v -> new SalespersonVisitAgendaResponseDto(
//                            v.getId(),
//                            v.getAgendaDate(),
//                            v.getSalespersonId(),
//                            v.getSalespersonName(),
//                            v.getClientId(),
//                            v.getClientName(),
//                            v.getClientCNPJ(),
//                            v.getClientCPF(),
//                            v.getAgendaInfo()
//                    ))
//                    .toList();
//        } else {
//            //Lista visitas do usuário logado
//            return this.repository.findAll()
//                    .stream()
//                    .filter(v -> v.getSalespersonId() == salespersonResult.getId() && v.getStatus() == StatusVisitEnum.agendado)
//                    .filter(v -> {
//                        Date agenda = v.getAgendaDate();
//
//                        return agenda != null
//                                && !agenda.before(inicio)
//                                && agenda.before(fim);
//                    })
//                    .map(v -> new SalespersonVisitAgendaResponseDto(
//                            v.getId(),
//                            v.getAgendaDate(),
//                            v.getSalespersonId(),
//                            v.getSalespersonName(),
//                            v.getClientId(),
//                            v.getClientName(),
//                            v.getClientCNPJ(),
//                            v.getClientCPF(),
//                            v.getAgendaInfo()
//                    ))
//                    .toList();
//        }


    }


    private Integer permittedCreationSalesperson(User user, Integer permission) {
        if (permissionUser.findPermissionId(user.getCompanyId(), user.getResaleId(), user.getId(), permission) != null) return null;
        Salesperson own = salespersonRepository.findByCompanyIdAndResaleIdAndUserId(user.getCompanyId(), user.getResaleId(), user.getId());
        if (own == null || own.getStatus() != StatusEnableDisable.Habilitado) throw new BusinessException("Vendedor nao habilitado.");
        return own.getId();
    }

    private Salesperson authorizeAssignment(User user, Integer salespersonId, Integer permission) {
        Integer own = permittedCreationSalesperson(user, permission);
        if (own != null && !Objects.equals(own, salespersonId)) throw new BusinessException("Sem permissao para registrar para este vendedor.");
        Salesperson assigned = salespersonRepository.findByCompanyIdAndResaleIdAndId(user.getCompanyId(), user.getResaleId(), salespersonId);
        if (assigned == null || assigned.getStatus() != StatusEnableDisable.Habilitado) throw new BusinessException("Selecione um vendedor habilitado da revenda.");
        return assigned;
    }

    @Override
    public List<com.concierge.apiconcierge.dtos.crm.visit.VisitSalespersonOptionDto> creationSalespersons(boolean agenda, String emailUser) {
        User user = userRepository.loginEmail(emailUser);
        if (user == null || user.getStatus() != StatusEnableDisable.Habilitado) throw new BusinessException("Usuario bloqueado.");
        Integer own = permittedCreationSalesperson(user, agenda ? CREATE_AGENDA_ALL_SALESPERSON : REGISTER_VISIT_ALL_SALESPERSON);
        return salespersonRepository.findByCompanyIdAndResaleId(user.getCompanyId(), user.getResaleId()).stream()
                .filter(person -> person.getStatus() == StatusEnableDisable.Habilitado)
                .filter(person -> own == null || Objects.equals(own, person.getId()))
                .map(person -> new com.concierge.apiconcierge.dtos.crm.visit.VisitSalespersonOptionDto(person.getId(), person.getStatus(), person.getName(), person.getUserId(), person.getPhotoUrl()))
                .toList();
    }
}
