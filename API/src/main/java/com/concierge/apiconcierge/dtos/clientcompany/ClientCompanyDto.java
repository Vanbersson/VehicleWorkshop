package com.concierge.apiconcierge.dtos.clientcompany;

import com.concierge.apiconcierge.models.clientcompany.CliFor;
import com.concierge.apiconcierge.models.clientcompany.FisJur;
import com.concierge.apiconcierge.models.enums.StatusEnableDisable;

import java.util.Date;

public record ClientCompanyDto(
        Integer companyId,
        Integer resaleId,
        Date dateRegister,
        Integer id,
        StatusEnableDisable status,
        String name,
        String fantasia,
        Integer categoryId,
        CliFor clifor,
        FisJur fisjur,
        String cnpj,
        String ie,
        String im,
        String cpf,
        String rg,
        String rgExpedidor,
        Date dateBirth,
        String emailHome,
        String emailWork,
        String dddCellphone,
        String cellphone,
        String dddPhone,
        String phone,
        String zipCode,
        String state,
        String city,
        String neighborhood,
        String address,
        String addressNumber,
        String addressComplement,
        String contactName,
        String contactEmail,
        String contactDDDPhone,
        String contactPhone,
        String contactDDDCellphone,
        String contactCellphone
) {
}
