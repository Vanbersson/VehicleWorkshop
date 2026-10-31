package com.concierge.apiconcierge.services.crm.attendance;

import com.concierge.apiconcierge.dtos.crm.attendance.AttendanceResponseDto;
import com.concierge.apiconcierge.dtos.crm.attendance.AttendanceUpdateDto;
import com.concierge.apiconcierge.exceptions.BusinessException;
import com.concierge.apiconcierge.exceptions.ResourcesNotFoundException;
import com.concierge.apiconcierge.models.crm.attendance.CustomerAttendance;
import com.concierge.apiconcierge.models.crm.visit.SalespersonVisit;
import com.concierge.apiconcierge.models.crm.visit.StatusVisitEnum;
import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.salesperson.Salesperson;
import com.concierge.apiconcierge.models.user.User;
import com.concierge.apiconcierge.repositories.crm.attendance.ICustomerAttendanceRepository;
import com.concierge.apiconcierge.repositories.permission.IPermissionUserRepository;
import com.concierge.apiconcierge.repositories.salesperson.ISalespersonRepository;
import com.concierge.apiconcierge.repositories.user.IUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import static com.concierge.apiconcierge.util.ConstantsPermission.LIST_VISIT_ALL_SALESPERSON;

@Service
public class CustomerAttendanceService {
    @Autowired private ICustomerAttendanceRepository repository;
    @Autowired private com.concierge.apiconcierge.repositories.crm.visit.ISalespersonVisitRepository visitRepository;
    @Autowired private com.concierge.apiconcierge.repositories.crm.attendance.IAttendanceQuoteRepository quoteRepository;
    @Autowired private com.concierge.apiconcierge.repositories.clientcompany.IClientCompanyRepository clientRepository;
    @Autowired private IUserRepository userRepository;
    @Autowired private ISalespersonRepository salespersonRepository;
    @Autowired private IPermissionUserRepository permissionRepository;

    // Called while the originating visit is locked by the completion transaction.
    @Transactional
    public CustomerAttendance createForVisit(SalespersonVisit visit) {
        if (visit.getId() == null || visit.getStatus() != StatusVisitEnum.concluído) {
            throw new BusinessException("Conclua a visita antes de gerar o atendimento.");
        }
        return repository.findByVisitId(visit.getId()).orElseGet(() -> {
            CustomerAttendance attendance = new CustomerAttendance();
            attendance.setCompanyId(visit.getCompanyId());
            attendance.setResaleId(visit.getResaleId());
            attendance.setVisitId(visit.getId());
            attendance.setClientId(visit.getClientId());
            attendance.setClientName(visit.getClientName());
            attendance.setSalespersonId(visit.getSalespersonId());
            attendance.setSalespersonName(visit.getSalespersonName());
            attendance.setDateCreated(new Date());
            attendance.setDateVisit(visit.getDateVisit());
            return repository.saveAndFlush(attendance);
        });
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponseDto> list(String email) {
        return search(new com.concierge.apiconcierge.dtos.crm.attendance.AttendanceSearchDto(null, "", ""), false, email);
    }

    @Transactional(readOnly = true)
    public List<AttendanceResponseDto> search(com.concierge.apiconcierge.dtos.crm.attendance.AttendanceSearchDto data, boolean cancelled, String email) {
        String client = data.clientName() == null ? "" : data.clientName().trim();
        String salesperson = data.salespersonName() == null ? "" : data.salespersonName().trim();
        if (cancelled && data.id() == null && client.isBlank() && salesperson.isBlank()) throw new BusinessException("Informe o código do atendimento, cliente ou vendedor para consultar cancelados.");
        User user = currentUser(email);
        Integer ownSalesperson = permittedSalesperson(user);
        List<CustomerAttendance> attendances = repository.search(user.getCompanyId(), user.getResaleId(), ownSalesperson, com.concierge.apiconcierge.models.crm.attendance.AttendanceStatus.CANCELLED, cancelled, data.id(), client, salesperson).stream()
                .filter(a -> ownSalesperson == null || Objects.equals(a.getSalespersonId(), ownSalesperson)).toList();
        if (attendances.isEmpty()) return List.of();
        java.util.Map<Integer, java.math.BigDecimal> totals = quoteRepository.findTotals(user.getCompanyId(), user.getResaleId(), attendances.stream().map(CustomerAttendance::getId).toList()).stream()
                .collect(java.util.stream.Collectors.toMap(com.concierge.apiconcierge.dtos.crm.attendance.QuoteTotalDto::attendanceId, com.concierge.apiconcierge.dtos.crm.attendance.QuoteTotalDto::total));
        return attendances.stream().map(a -> AttendanceResponseDto.from(a, totals.get(a.getId()))).toList();
    }

    @Transactional
    public AttendanceResponseDto update(AttendanceUpdateDto data, String email) {
        User user = currentUser(email);
        Integer ownSalesperson = permittedSalesperson(user);
        CustomerAttendance attendance = repository.findByCompanyIdAndResaleIdAndId(user.getCompanyId(), user.getResaleId(), data.id())
                .orElseThrow(() -> new ResourcesNotFoundException("Atendimento não encontrado."));
        if (ownSalesperson != null && !Objects.equals(attendance.getSalespersonId(), ownSalesperson)) {
            throw new BusinessException("Você não tem permissão para alterar este atendimento.");
        }
        if (!Objects.equals(attendance.getVersion(), data.version())) {
            throw new BusinessException("Este atendimento foi alterado. Atualize a lista antes de tentar novamente.");
        }
        if (attendance.getStatus() == com.concierge.apiconcierge.models.crm.attendance.AttendanceStatus.CANCELLED) throw new BusinessException("O atendimento está cancelado e não pode ser alterado.");
        if (data.status() == com.concierge.apiconcierge.models.crm.attendance.AttendanceStatus.CANCELLED) throw new BusinessException("Use a ação de cancelamento e informe o motivo.");
        if (data.clientId() != null && !Objects.equals(data.clientId(), attendance.getClientId())) {
            var client = clientRepository.filterId(user.getCompanyId(), user.getResaleId(), data.clientId());
            if (client == null) throw new ResourcesNotFoundException("Cliente nao encontrado nesta empresa e revenda.");
            if (client.getStatus() != StatusEnableDisable.Habilitado) throw new BusinessException("Selecione um cliente habilitado.");
            attendance.setClientId(client.getId());
            attendance.setClientName(client.getName());
        }
        if (data.status() == com.concierge.apiconcierge.models.crm.attendance.AttendanceStatus.APPROVAL_PENDING && attendance.getStatus() != data.status()) attendance.setApprovalRequestedAt(new Date());
        if (data.status() == com.concierge.apiconcierge.models.crm.attendance.AttendanceStatus.COMPLETED && attendance.getStatus() != data.status()) attendance.setCompletedAt(new Date());
        if (data.status() != com.concierge.apiconcierge.models.crm.attendance.AttendanceStatus.COMPLETED) attendance.setCompletedAt(null);
        if (data.documentsNotes() != null) attendance.setDocumentsNotes(data.documentsNotes().trim());
        if (data.proposalNotes() != null) attendance.setProposalNotes(data.proposalNotes().trim());
        attendance.setStatus(data.status());
        attendance.setNotes(data.notes() == null ? "" : data.notes().trim());
        CustomerAttendance saved = repository.saveAndFlush(attendance);
        java.math.BigDecimal total = quoteRepository.findByCompanyIdAndResaleIdAndAttendanceId(saved.getCompanyId(), saved.getResaleId(), saved.getId()).map(com.concierge.apiconcierge.models.crm.attendance.AttendanceQuote::getTotal).orElse(null);
        return AttendanceResponseDto.from(saved, total);
    }

    @Transactional
    public AttendanceResponseDto cancel(com.concierge.apiconcierge.dtos.crm.attendance.AttendanceCancelDto data, String email) {
        if (data.reason() == null || data.reason().isBlank() || data.reason().trim().length() > 2000) throw new BusinessException("Informe o motivo do cancelamento, com até 2000 caracteres.");
        CustomerAttendance scope = authorizedAttendance(data.id(), email);
        CustomerAttendance attendance = repository.findForQuote(scope.getCompanyId(), scope.getResaleId(), scope.getId());
        if (attendance == null) throw new ResourcesNotFoundException("Atendimento não encontrado.");
        if (attendance.getStatus() == com.concierge.apiconcierge.models.crm.attendance.AttendanceStatus.CANCELLED) throw new BusinessException("Este atendimento já está cancelado.");
        if (!Objects.equals(attendance.getVersion(), data.version())) throw new BusinessException("Este atendimento foi alterado. Atualize a lista antes de cancelar.");
        User user = currentUser(email);
        attendance.setStatus(com.concierge.apiconcierge.models.crm.attendance.AttendanceStatus.CANCELLED);
        attendance.setCancellationReason(data.reason().trim());
        attendance.setCancelledAt(new Date());
        attendance.setCancelledById(user.getId());
        attendance.setCancelledByName(user.getName());
        CustomerAttendance saved = repository.saveAndFlush(attendance);
        java.math.BigDecimal total = quoteRepository.findByCompanyIdAndResaleIdAndAttendanceId(saved.getCompanyId(), saved.getResaleId(), saved.getId()).map(com.concierge.apiconcierge.models.crm.attendance.AttendanceQuote::getTotal).orElse(null);
        return AttendanceResponseDto.from(saved, total);
    }

    @Transactional(readOnly = true)
    public com.concierge.apiconcierge.dtos.crm.attendance.AttendanceDetailDto detail(Integer id, String email) {
        CustomerAttendance attendance = authorizedAttendance(id, email);
        SalespersonVisit visit = visitRepository.findByCompanyIdAndResaleIdAndId(attendance.getCompanyId(), attendance.getResaleId(), attendance.getVisitId());
        if (visit == null) throw new ResourcesNotFoundException("Visita de origem não encontrada.");
        java.math.BigDecimal total = quoteRepository.findByCompanyIdAndResaleIdAndAttendanceId(attendance.getCompanyId(), attendance.getResaleId(), attendance.getId()).map(com.concierge.apiconcierge.models.crm.attendance.AttendanceQuote::getTotal).orElse(null);
        return new com.concierge.apiconcierge.dtos.crm.attendance.AttendanceDetailDto(AttendanceResponseDto.from(attendance, total), visit);
    }

    @Transactional(readOnly = true)
    public CustomerAttendance authorizedAttendance(Integer id, String email) {
        User user = currentUser(email);
        Integer ownSalesperson = permittedSalesperson(user);
        CustomerAttendance a = repository.findByCompanyIdAndResaleIdAndId(user.getCompanyId(), user.getResaleId(), id).orElseThrow(() -> new ResourcesNotFoundException("Atendimento não encontrado."));
        if (ownSalesperson != null && !Objects.equals(a.getSalespersonId(), ownSalesperson)) throw new BusinessException("Você não tem permissão para acessar este atendimento.");
        return a;
    }

    private User currentUser(String email) {
        User user = userRepository.loginEmail(email);
        if (user == null || user.getStatus() == StatusEnableDisable.Desabilitado) throw new BusinessException("Usuário Bloqueado.");
        return user;
    }

    private Integer permittedSalesperson(User user) {
        if (permissionRepository.findPermissionId(user.getCompanyId(), user.getResaleId(), user.getId(), LIST_VISIT_ALL_SALESPERSON) != null) return null;
        Salesperson salesperson = salespersonRepository.findByCompanyIdAndResaleIdAndUserId(user.getCompanyId(), user.getResaleId(), user.getId());
        if (salesperson == null || salesperson.getStatus() == StatusEnableDisable.Desabilitado) throw new BusinessException("Vendedor não habilitado.");
        return salesperson.getId();
    }
}
