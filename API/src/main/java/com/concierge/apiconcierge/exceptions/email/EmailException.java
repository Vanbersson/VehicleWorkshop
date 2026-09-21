package com.concierge.apiconcierge.exceptions.email;

public class EmailException extends Exception{
    public EmailException(){
        super("Error E-mail.");
    }

    public EmailException(String message){
        super(message);
    }

}
