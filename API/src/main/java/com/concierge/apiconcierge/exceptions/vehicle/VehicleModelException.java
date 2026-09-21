package com.concierge.apiconcierge.exceptions.vehicle;

public class VehicleModelException extends Exception{
    public VehicleModelException(){
        super("Error Vehicle Model");
    }
    public VehicleModelException(String message){
        super(message);
    }
}
