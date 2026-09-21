package com.concierge.apiconcierge.controllers.workshop.toolcontrol;

import com.concierge.apiconcierge.dtos.message.MessageResponseDto;
import com.concierge.apiconcierge.dtos.workshop.toolcontrol.ToolControlCategoryDto;
import com.concierge.apiconcierge.models.workshop.toolcontrol.ToolControlCategory;
import com.concierge.apiconcierge.services.workshop.toolcontrol.category.ToolControlCategoryService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/workshop/tool/control/category")
public class ToolControlCategoryController {

    @Autowired
    ToolControlCategoryService service;

    @PostMapping("/save")
    public ResponseEntity<Object> save(@RequestBody ToolControlCategoryDto data) {
        try {
            ToolControlCategory cat = new ToolControlCategory();
            BeanUtils.copyProperties(data, cat);
            Map<String, Object> result = this.service.save(cat);
            return ResponseEntity.status(HttpStatus.CREATED).body(result);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @PostMapping("/update")
    public ResponseEntity<Object> update(@RequestBody ToolControlCategoryDto data) {
        try {
            ToolControlCategory cat = new ToolControlCategory();
            BeanUtils.copyProperties(data, cat);
            String message = this.service.update(cat);
            return ResponseEntity.status(HttpStatus.OK).body(new MessageResponseDto(message));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/all")
    public ResponseEntity<Object> listAll(@PathVariable(name = "companyId") Integer companyId,
                                          @PathVariable(name = "resaleId") Integer resaleId) {
        try {
            List<ToolControlCategory> result = this.service.listAll(companyId, resaleId);
            return ResponseEntity.status(HttpStatus.OK).body(result);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/all/enabled")
    public ResponseEntity<Object> listAllEnabled(@PathVariable(name = "companyId") Integer companyId,
                                                 @PathVariable(name = "resaleId") Integer resaleId) {
        try {
            List<ToolControlCategory> result = this.service.listAllEnabled(companyId, resaleId);
            return ResponseEntity.status(HttpStatus.OK).body(result);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }
}
