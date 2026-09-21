package com.concierge.apiconcierge.exceptions.workshop.mechanic;

public class MechanicException extends Exception {
    public MechanicException(){
        super("Error Mechanic.");
    }

    public MechanicException(String message){
        super(message);
    }
}
