package com.concierge.apiconcierge.exceptions.user;

public class UserException extends Exception {
    public UserException() {
        super("Error user.");
    }
    public UserException(String message) {
        super(message);
    }


}
