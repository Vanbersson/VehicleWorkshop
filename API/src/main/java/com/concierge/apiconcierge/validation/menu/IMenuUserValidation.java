package com.concierge.apiconcierge.validation.menu;

import com.concierge.apiconcierge.models.menu.MenuUser;
import com.concierge.apiconcierge.models.message.MessageResponse;

import java.util.List;
import java.util.Map;

public interface IMenuUserValidation {
    public MessageResponse save(MenuUser menu);

    public MessageResponse update(MenuUser menu);

    public MessageResponse filterMenus(MenuUser menu);

    public MessageResponse deleteMenus(MenuUser menu);
}
