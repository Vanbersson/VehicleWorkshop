package com.concierge.apiconcierge.exceptions.clientcompany;

public class ClientCompanyException extends Exception{

    public ClientCompanyException(){
        super("Error ClientCompany.");
    }
    public ClientCompanyException(String message){
        super(message);
    }


}
