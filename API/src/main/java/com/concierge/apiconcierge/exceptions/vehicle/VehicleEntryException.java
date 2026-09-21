package com.concierge.apiconcierge.exceptions.vehicle;

public class VehicleEntryException extends Exception{

    public VehicleEntryException(){
        super("Error Vehicle Entry");
    }
    public VehicleEntryException(String message){
        super(message);
    }


}
