package com.concierge.apiconcierge.exceptions.parts;

public class PartsException extends Exception{

    public PartsException(){
        super("Error Parts.");
    }
    public PartsException(String message){
        super(message);
    }
}
