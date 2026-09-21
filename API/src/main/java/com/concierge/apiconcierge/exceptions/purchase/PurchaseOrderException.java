package com.concierge.apiconcierge.exceptions.purchase;

public class PurchaseOrderException extends Exception {

    public PurchaseOrderException() {
        super("Error PurchaseOrder");
    }

    public PurchaseOrderException(String message) {
        super(message);
    }
}
