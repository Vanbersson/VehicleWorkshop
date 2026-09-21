package com.concierge.apiconcierge.controllers.notification;

import com.concierge.apiconcierge.dtos.message.MessageResponseDto;
import com.concierge.apiconcierge.dtos.notification.NotificationUserDto;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.notification.Notification;
import com.concierge.apiconcierge.services.auth.TokenService;
import com.concierge.apiconcierge.services.notification.user.INotificationUserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notification/user")
public class NotificationUserController {
    @Autowired
    private INotificationUserService service;

    @Autowired
    private TokenService tokenService;

    @GetMapping("/{companyId}/{resaleId}/filter/u/{user}")
    public ResponseEntity<Object> filterUser(@PathVariable(name = "companyId") Integer companyId,
                                             @PathVariable(name = "resaleId") Integer resaleId,
                                             @PathVariable(name = "user") Integer userId) {
        try {
            List<Notification> result = this.service.filterUser(companyId, resaleId, userId);
            return ResponseEntity.status(HttpStatus.OK).body(result);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @PostMapping("/delete")
    public ResponseEntity<Object> deleteNotification(@RequestBody NotificationUserDto data, HttpServletRequest request) {
        try {
            String userEmail = this.getEmail(request);
            MessageResponse result = this.service.delete(data, userEmail);
            return ResponseEntity.status(HttpStatus.OK).body(result);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    private String getEmail(HttpServletRequest request) {
        String token = request.getHeader("Authorization").replace("Bearer ", "");
        return this.tokenService.validToken(token);
    }
}
