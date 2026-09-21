package com.concierge.apiconcierge.dtos.driver;

import com.concierge.apiconcierge.models.enums.MaleFemale;
import com.concierge.apiconcierge.models.enums.StatusEnableDisable;

import java.util.Date;

public record DriverDto(Integer companyId,

                        Integer resaleId,

                        Date dateRegister,

                        Integer id,

                        StatusEnableDisable status,

                        String name,

                        String cpf,

                        String rg,

                        Date dateBirth,

                        String cnhRegister,

                        MaleFemale maleFemale,

                        String cnhCategory,

                        Date cnhValidation,

                        String email,

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

                        String photoDriverUrl,

                        String photoDoc1Url,

                        String photoDoc2Url
) {
}
