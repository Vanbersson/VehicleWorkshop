package com.concierge.apiconcierge.exceptions.driver;

public class DriverException extends Exception {

    public DriverException() {
        super("Error Driver");
    }

    public DriverException(String message) {
        super(message);
    }
}
