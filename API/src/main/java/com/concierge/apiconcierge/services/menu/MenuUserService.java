package com.concierge.apiconcierge.services.menu;

import com.concierge.apiconcierge.exceptions.menu.MenuUserException;
import com.concierge.apiconcierge.models.menu.IMenuUserReport;
import com.concierge.apiconcierge.models.menu.MenuUser;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.repositories.menu.IMenuUserRepository;
import com.concierge.apiconcierge.util.ConstantsMessage;
import com.concierge.apiconcierge.validation.menu.IMenuUserValidation;
import com.concierge.apiconcierge.validation.menu.MenuUserValidation;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MenuUserService implements IMenuUserService {

    @Autowired
    private IMenuUserRepository repository;
    @Autowired
    private IMenuUserValidation validation;

    @SneakyThrows
    @Override
    public MessageResponse save(MenuUser menu) {
        try {
            MessageResponse response = this.validation.save(menu);
            if (response.getStatus().equals(ConstantsMessage.SUCCESS)) {
                menu.setId(null);
                this.repository.save(menu);
            }
            return response;
        } catch (Exception ex) {
            throw new MenuUserException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse update(MenuUser menu) {
        try {
            MessageResponse response = this.validation.update(menu);
            if (response.getStatus().equals(ConstantsMessage.SUCCESS)) {
                this.repository.save(menu);
            }
            return response;
        } catch (Exception ex) {
            throw new MenuUserException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public List<Map<String, Object>> filterMenus(MenuUser menu) {
        try {
            MessageResponse response = this.validation.filterMenus(menu);
            if (response.getStatus().equals(ConstantsMessage.SUCCESS)) {
                List<IMenuUserReport> list = this.repository.filterUserId(menu.getCompanyId(), menu.getResaleId(), menu.getUserId());
                List<Map<String, Object>> menus = new ArrayList<>();
                for (var item : list) {
                    Map<String, Object> map = new HashMap<>();
                    map.put("companyId", item.getCompanyId());
                    map.put("resaleId", item.getResaleId());
                    map.put("key", item.getKey());
                    map.put("menu", item.getMenu());
                    menus.add(map);
                }
                return menus;
            }
            return List.of();
        } catch (Exception ex) {
            throw new MenuUserException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse deleteMenu(MenuUser menu) {
        try {
            MessageResponse response = this.validation.deleteMenus(menu);
            if (response.getStatus().equals(ConstantsMessage.SUCCESS)) {
                this.repository.deleteMenu(menu.getCompanyId(), menu.getResaleId(), menu.getUserId());
            }
            return response;
        } catch (Exception ex) {
            throw new MenuUserException(ex.getMessage());

        }
    }
}
