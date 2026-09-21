package com.concierge.apiconcierge.controllers.permission;

import com.concierge.apiconcierge.models.permission.Permission;
import com.concierge.apiconcierge.repositories.permission.IPermissionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/permission")
public class PermissionController {

    @Autowired
    private IPermissionRepository repository;

    @GetMapping("/all")
    public ResponseEntity<List<Permission>> allPermission() {
        return ResponseEntity.ok(repository.findAll());
    }

}
