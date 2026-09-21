package com.concierge.apiconcierge.controllers.brand;

import com.concierge.apiconcierge.dtos.brand.BrandDto;
import com.concierge.apiconcierge.dtos.message.MessageResponseDto;
import com.concierge.apiconcierge.models.brand.Brand;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.services.auth.TokenService;
import com.concierge.apiconcierge.services.brand.IBrandService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/brand")
public class BrandController {

    @Autowired
    private IBrandService service;
    @Autowired
    private TokenService tokenService;

    @PostMapping("/save")
    public ResponseEntity<Object> save(@RequestBody BrandDto data) {
        try {
            Brand b = new Brand();
            BeanUtils.copyProperties(data, b);
            MessageResponse response = this.service.save(b);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @PostMapping("/update")
    public ResponseEntity<Object> update(@RequestBody BrandDto data, HttpServletRequest request) {
        try {
            String userEmail = this.getEmail(request);
            Brand b = new Brand();
            BeanUtils.copyProperties(data, b);
            MessageResponse response = this.service.update(b,userEmail);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/list/all")
    public ResponseEntity<Object> listAll() {
        try {
            List<Brand> response = this.service.listAll();
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }
    @GetMapping("/list/all/enabled")
    public ResponseEntity<Object> listAllEnabled() {
        try {
            List<Brand> response = this.service.listAllEnabled();
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }
    private String getEmail(HttpServletRequest request) {
        String token = request.getHeader("Authorization").replace("Bearer ", "");
        return this.tokenService.validToken(token);
    }

}
