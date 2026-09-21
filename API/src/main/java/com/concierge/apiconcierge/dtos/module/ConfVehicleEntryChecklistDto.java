package com.concierge.apiconcierge.dtos.module;

import com.concierge.apiconcierge.models.enums.YesNot;

public record ConfVehicleEntryChecklistDto(
        Integer companyId,
        Integer resaleId,
        Integer id,

        YesNot checklist1Enabled,
        String checklist1Desc,

        YesNot checklist2Enabled,
        String checklist2Desc,

        YesNot checklist3Enabled,
        String checklist3Desc,

        YesNot checklist4Enabled,
        String checklist4Desc,

        YesNot checklist5Enabled,
        String checklist5Desc,

        YesNot checklist6Enabled,
        String checklist6Desc,

        YesNot checklist7Enabled,
        String checklist7Desc,

        YesNot checklist8Enabled,
        String checklist8Desc,

        YesNot checklist9Enabled,
        String checklist9Desc,

        YesNot checklist10Enabled,
        String checklist10Desc,

        YesNot checklist11Enabled,
        String checklist11Desc,

        YesNot checklist12Enabled,
        String checklist12Desc,

        YesNot checklist13Enabled,
        String checklist13Desc,

        YesNot checklist14Enabled,
        String checklist14Desc,

        YesNot checklist15Enabled,
        String checklist15Desc,

        YesNot checklist16Enabled,
        String checklist16Desc,

        YesNot checklist17Enabled,
        String checklist17Desc,

        YesNot checklist18Enabled,
        String checklist18Desc,

        YesNot checklist19Enabled,
        String checklist19Desc,

        YesNot checklist20Enabled,
        String checklist20Desc) {
}
