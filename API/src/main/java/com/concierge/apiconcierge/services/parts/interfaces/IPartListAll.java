package com.concierge.apiconcierge.services.parts.interfaces;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;

public interface IPartListAll {
    Integer getId();

    Integer getStatus();

    String getDescription();

    String getCode();

    String getBrand();

    String getGroup();

    String getCategory();

}
