package com.concierge.apiconcierge.services.menu;

import com.concierge.apiconcierge.models.menu.MenuUser;
import com.concierge.apiconcierge.models.message.MessageResponse;

import java.util.List;
import java.util.Map;

public interface IMenuUserService {

    MessageResponse save(MenuUser menu);

    MessageResponse update(MenuUser menu);

    List<Map<String, Object>> filterMenus(MenuUser menu);

    MessageResponse deleteMenu(MenuUser menu);
}
