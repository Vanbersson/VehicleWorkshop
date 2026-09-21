package com.concierge.apiconcierge.models.workshop.toolcontrol.report;

import java.util.Date;

public interface IToolControlReport {

    Integer getCompanyId();

    Integer getResaleId();

    Integer getRequestId();

    Integer getRequestStatus();

    Integer getRequestType();

    Integer getRequestUserId();

    String getRequestUserName();

    Date getRequestDate();

    String getRequestInformation();


    Integer getCategoryId();

    String getCategoryDesc();


    byte[] getMatMecId();

    Integer getMatMecDelivUserId();

    String getMatMecDelivUserName();

    float getMatMecDelivQuantity();

    Date getMatMecDelivDate();

    String getMatMecDelivInfor();

    Integer getMatMecReturUserId();

    String getMatMecReturUserName();

    float getMatMecReturQuantity();

    Date getMatMecReturDate();

    String getMatMecReturInfor();

    Integer getMatMecMaterialId();

    String getMatMecMaterialDesc();

}
