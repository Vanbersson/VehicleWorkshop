package com.concierge.apiconcierge.repositories.parts.interfaces;

public interface IFilterPart {
    Integer getId();

    String getCode();

    String getDescription();

    double getAvailable();

    float getPrice();

    String getUnit();

    String getBrand();

    String getGroup();

    String getCategory();
}
