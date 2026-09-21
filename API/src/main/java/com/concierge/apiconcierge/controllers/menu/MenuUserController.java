package com.concierge.apiconcierge.controllers.menu;

import com.concierge.apiconcierge.dtos.message.MessageResponseDto;
import com.concierge.apiconcierge.dtos.menu.MenuUserDto;
import com.concierge.apiconcierge.models.menu.MenuUser;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.services.menu.IMenuUserService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/menu/user")
public class MenuUserController {

    @Autowired
  private IMenuUserService service;

    @PostMapping("/save")
    public ResponseEntity<Object> save(@RequestBody MenuUserDto data) {
        try {
            MenuUser menu = new MenuUser();
            BeanUtils.copyProperties(data, menu);
            MessageResponse response = this.service.save(menu);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @PostMapping("/update")
    public ResponseEntity<Object> update(@RequestBody MenuUserDto data) {
        try {
            MenuUser menu = new MenuUser();
            BeanUtils.copyProperties(data, menu);
            MessageResponse response = this.service.update(menu);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/filter/user/{userId}")
    public ResponseEntity<Object> filterMenu(@PathVariable(name = "companyId")Integer companyId,
                                              @PathVariable(name = "resaleId")Integer resaleId,
                                              @PathVariable(name = "userId")Integer userId){
        try{
            MenuUser menu = new MenuUser();
            menu.setCompanyId(companyId);
            menu.setResaleId(resaleId);
            menu.setUserId(userId);
            List<Map<String, Object>> response = this.service.filterMenus(menu);
            return  ResponseEntity.status(HttpStatus.OK).body(response);
        }catch (Exception ex){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }

    }

    @PostMapping("/delete")
    public ResponseEntity<Object> delete(@RequestBody MenuUserDto data){
        try{
            MenuUser menu = new MenuUser();
            BeanUtils.copyProperties(data, menu);
            MessageResponse response = this.service.deleteMenu(menu);
            return  ResponseEntity.status(HttpStatus.OK).body(response);
        }catch (Exception ex){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }
}
