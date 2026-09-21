package com.concierge.apiconcierge.exceptions.budget;

public class BudgetException extends Exception{

    public BudgetException(){
        super("Error Budget.");
    }

    public BudgetException(String message){
        super(message);
    }
}
