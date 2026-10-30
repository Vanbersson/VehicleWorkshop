package com.concierge.apiconcierge.dtos.crm.visit;

import com.concierge.apiconcierge.models.crm.visit.ContactTypeEnum;
import com.concierge.apiconcierge.models.crm.visit.StatusVisitEnum;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Date;

public record SalespersonVisitRegisterUpdateDto(
        @NotNull(message = "Empresa é obrigatório")
        Integer companyId,
        @NotNull(message = "Revenda é obrigatório")
        Integer resaleId,
        @NotNull(message = "Código é obrigatório")
        Integer id,
        @NotNull(message = "Status é obrigatório")
        StatusVisitEnum status,
        @NotNull(message = "Data registro é obrigatório")
        Date dateRegister,
        @NotNull(message = "Código usuário é obrigatório")
        Integer userIdRegister,
        @NotBlank(message = "Nome usuário é obrigatório")
        String userNameRegister,

        Date dateVisit,
        @NotNull(message = "Código vendedor é obrigatório")
        Integer salespersonId,
        @NotBlank(message = "Nome vendedor é obrigatório")
        String salespersonName,
        String salespersonInfo,
        ContactTypeEnum contactType,
        String contact,
        Integer clientId,
        @NotBlank(message = "Nome cliente é obrigatório")
        String clientName,
        String clientCNPJ,
        String clientCPF,
        String latitude,
        String longitude,
        String reasonVisit,
        String reasonVisitInfo,
        String products,
        String productsInfo,
        String agendaInfo,
        Date agendaDate) {
}
