package com.concierge.apiconcierge.controllers.user;

import com.concierge.apiconcierge.dtos.message.MessageResponseDto;
import com.concierge.apiconcierge.dtos.user.UserDto;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.user.User;
import com.concierge.apiconcierge.services.auth.TokenService;
import com.concierge.apiconcierge.services.user.IUserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private IUserService service;
    @Autowired
    private TokenService tokenService;

    @PostMapping("/save")
    public ResponseEntity<Object> save(@RequestBody UserDto data) {
        try {
            User user = new User();
            BeanUtils.copyProperties(data, user);
            MessageResponse response = this.service.save(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @PostMapping("/update")
    public ResponseEntity<Object> update(@RequestBody UserDto data) {
        try {
            User user = new User();
            BeanUtils.copyProperties(data, user);
            MessageResponse response = this.service.update(user);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @PostMapping("/update/password")
    public ResponseEntity<Object> updatePass(@RequestParam(name = "companyId") Integer companyId,
                                             @RequestParam(name = "resaleId") Integer resaleId,
                                             @RequestParam(name = "id") Integer id,
                                             @RequestParam("password") String password) {
        try {
            MessageResponse response = this.service.updatePass(companyId, resaleId, id, password);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/all")
    public ResponseEntity<Object> listAll(@PathVariable(name = "companyId") Integer companyId,
                                          @PathVariable(name = "resaleId") Integer resaleId) {
        try {
            MessageResponse response = this.service.listAll(companyId, resaleId);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/filter/id/{id}")
    public ResponseEntity<Object> filterId(@PathVariable(name = "companyId") Integer companyId,
                                           @PathVariable(name = "resaleId") Integer resaleId,
                                           @PathVariable(name = "id") Integer id) {
        try {
            MessageResponse response = this.service.filterId(companyId, resaleId, id);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/filter/email/{email}")
    public ResponseEntity<Object> filterEmail(@PathVariable(name = "companyId") Integer companyId,
                                              @PathVariable(name = "resaleId") Integer resaleId,
                                              @PathVariable(name = "email") String email) {
        try {
            MessageResponse response = this.service.filterEmail(companyId, resaleId, email);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/filter/role/{id}")
    public ResponseEntity<Object> filterRoleId(@PathVariable(name = "companyId") Integer companyId,
                                               @PathVariable(name = "resaleId") Integer resaleId,
                                               @PathVariable(name = "id") Integer id) {
        try {
            MessageResponse response = this.service.filterRoleId(companyId, resaleId, id);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @PostMapping("/upload/image")
    public ResponseEntity<Object> saveImage(@RequestParam("file") MultipartFile file,
                                            @RequestParam("local") String local) {
        try {
            MessageResponse response = this.service.saveImage(file, local);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @PostMapping("/delete/image")
    public ResponseEntity<Object> deleteImage(@RequestParam("local") String local) {
        try {
            MessageResponse response = this.service.deleteImage(local);
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
