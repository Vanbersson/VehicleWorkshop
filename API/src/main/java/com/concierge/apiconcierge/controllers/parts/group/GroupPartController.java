package com.concierge.apiconcierge.controllers.parts.group;

import com.concierge.apiconcierge.dtos.message.MessageResponseDto;
import com.concierge.apiconcierge.dtos.parts.PartDto;
import com.concierge.apiconcierge.dtos.parts.group.GroupPartDto;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.part.Part;
import com.concierge.apiconcierge.models.part.group.GroupPart;
import com.concierge.apiconcierge.services.parts.group.IGroupPartService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/part/group")
public class GroupPartController {

    @Autowired
    private IGroupPartService service;

    @PostMapping("/save")
    public ResponseEntity<Object> save(@RequestBody GroupPartDto data) {
        try {
            GroupPart group = new GroupPart();
            BeanUtils.copyProperties(data, group);
            MessageResponse response = this.service.save(group);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @PostMapping("/update")
    public ResponseEntity<Object> update(@RequestBody GroupPartDto data) {
        try {
            GroupPart group = new GroupPart();
            BeanUtils.copyProperties(data, group);
            MessageResponse response = this.service.update(group);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/list/all")
    public ResponseEntity<Object> listAll(@PathVariable(name = "companyId") Integer companyId,
                                          @PathVariable(name = "resaleId") Integer resaleId) {
        try {
            List<GroupPart> groups = this.service.listAll(companyId, resaleId);
            return ResponseEntity.status(HttpStatus.OK).body(groups);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/filter/brand/{id}")
    public ResponseEntity<Object> filterBrand(@PathVariable(name = "companyId") Integer companyId,
                                              @PathVariable(name = "resaleId") Integer resaleId,
                                              @PathVariable(name = "id") Integer brandId) {
        try {
            List<GroupPart> groups = this.service.filterBrand(companyId, resaleId, brandId);
            return ResponseEntity.status(HttpStatus.OK).body(groups);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }
}
