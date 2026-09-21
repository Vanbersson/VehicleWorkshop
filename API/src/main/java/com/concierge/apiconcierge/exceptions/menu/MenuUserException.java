package com.concierge.apiconcierge.exceptions.menu;

public class MenuUserException extends Exception{

    public MenuUserException(){
        super("Error Menu.");
    }

    public MenuUserException(String message){
        super(message);
    }
}
