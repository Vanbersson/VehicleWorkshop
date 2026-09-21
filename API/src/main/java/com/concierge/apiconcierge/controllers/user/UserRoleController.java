package com.concierge.apiconcierge.controllers.user;


import com.concierge.apiconcierge.dtos.UserRoleDto;
import com.concierge.apiconcierge.models.role.UserRole;
import com.concierge.apiconcierge.repositories.user.IUserRoleRepository;
import jakarta.validation.Valid;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/user/role")
public class UserRoleController {

    @Autowired
    IUserRoleRepository repository;

    @PostMapping("/save")
    public ResponseEntity<Object> save(@RequestBody UserRoleDto data) {
        UserRole role = new UserRole();
        BeanUtils.copyProperties(data, role);
        role.setId(null);
        return ResponseEntity.status(HttpStatus.CREATED).body(repository.save(role));
    }

    @PostMapping("/update")
    public ResponseEntity<Object> update(@RequestBody UserRoleDto data) {
        UserRole role = new UserRole();
        BeanUtils.copyProperties(data, role);
        return ResponseEntity.status(HttpStatus.OK).body(repository.save(role));
    }

    @GetMapping("/{companyId}/{resaleId}/all")
    public ResponseEntity<List<UserRole>> listAll(@PathVariable(name = "companyId") Integer companyId,
                                                  @PathVariable(name = "resaleId") Integer resaleId) {
        List<UserRole> roles = repository.listAll(companyId, resaleId);
        return ResponseEntity.ok(roles);
    }

    @GetMapping("/{companyId}/{resaleId}/all/enabled")
    public ResponseEntity<List<UserRole>> listAllEnabled(@PathVariable(name = "companyId") Integer companyId,
                                                         @PathVariable(name = "resaleId") Integer resaleId) {
        List<UserRole> roles = repository.listAllEnabled(companyId, resaleId);
        return ResponseEntity.ok(roles);
    }

}
