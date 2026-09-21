package com.concierge.apiconcierge.exceptions.workshop.toolcontrol;

public class ToolControlException extends Exception{
    public ToolControlException(){
        super("Error Tool Control.");
    }

    public ToolControlException(String message){
        super(message);
    }
}
