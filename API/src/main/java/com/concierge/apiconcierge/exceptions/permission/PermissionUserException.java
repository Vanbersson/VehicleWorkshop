package com.concierge.apiconcierge.exceptions.permission;

public class PermissionUserException extends Exception {
    public PermissionUserException(){
        super("Error permission user.");
    }
    public PermissionUserException(String message){
        super(message);
    }
}
