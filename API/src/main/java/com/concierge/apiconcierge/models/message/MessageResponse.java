package com.concierge.apiconcierge.models.message;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class MessageResponse {
    private String status;
    private String header;
    private String message;
    private Object data;
}
