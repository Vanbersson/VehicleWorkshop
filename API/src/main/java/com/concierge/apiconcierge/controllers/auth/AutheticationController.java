package com.concierge.apiconcierge.controllers.auth;

import com.concierge.apiconcierge.dtos.auth.AuthenticationDto;
import com.concierge.apiconcierge.dtos.message.MessageResponseDto;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.user.User;
import com.concierge.apiconcierge.repositories.user.IUserRepository;
import com.concierge.apiconcierge.services.auth.TokenService;
import com.concierge.apiconcierge.util.ConstantsMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/auth")
public class AutheticationController {

    @Autowired
    TokenService tokenService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private IUserRepository repository;

    @PostMapping("/login")
    public ResponseEntity<Object> login(@RequestBody AuthenticationDto data) {
        try {
            var userNamePassword = new UsernamePasswordAuthenticationToken(data.email(), data.password());
            var auth = this.authenticationManager.authenticate(userNamePassword);
            var token = tokenService.generateToken((User) auth.getPrincipal());
            User user = this.repository.loginEmail(data.email());

            Map<String, Object> map = new HashMap<>();
            map.put("companyId", user.getCompanyId());
            map.put("resaleId", user.getResaleId());
            map.put("status",user.getStatus());
            map.put("id", user.getId());
            map.put("name", user.getName());
            map.put("email",user.getEmail());
            map.put("roleDesc", user.getRoleDesc());
            map.put("roleFunc", user.getRoleFunc());
            map.put("cellphone", user.getCellphone());
            map.put("limitDiscount", user.getLimitDiscount());
            map.put("token", token);
            map.put("photoUrl", user.getPhotoUrl());

            MessageResponse response = new MessageResponse();
            response.setStatus(ConstantsMessage.SUCCESS);
            response.setHeader("Bem-vindo");
            response.setMessage(user.getName());
            response.setData(map);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

    }

}
