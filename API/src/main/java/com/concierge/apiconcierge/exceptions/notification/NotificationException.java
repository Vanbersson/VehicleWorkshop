package com.concierge.apiconcierge.exceptions.notification;

public class NotificationException extends Exception {
    public NotificationException() {
        super("Error Notification.");
    }

    public NotificationException(String message) {
        super(message);
    }
}
