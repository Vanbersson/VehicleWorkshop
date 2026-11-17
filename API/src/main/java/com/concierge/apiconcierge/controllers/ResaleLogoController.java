package com.concierge.apiconcierge.controllers;

import com.concierge.apiconcierge.models.resales.Resale;
import com.concierge.apiconcierge.models.user.User;
import com.concierge.apiconcierge.services.resale.ResaleLogoService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/resale/{companyId}/{resaleId}/logo")
public class ResaleLogoController {
    private final ResaleLogoService service;

    public ResaleLogoController(ResaleLogoService service) {
        this.service = service;
    }

    @PostMapping(consumes = "multipart/form-data")
    public Resale save(@PathVariable Integer companyId, @PathVariable Integer resaleId,
                       @RequestParam("file") MultipartFile file, @AuthenticationPrincipal User user) {
        return service.save(companyId, resaleId, file, user);
    }

    @PostMapping("/delete")
    public Resale remove(@PathVariable Integer companyId, @PathVariable Integer resaleId,
                         @AuthenticationPrincipal User user) {
        return service.remove(companyId, resaleId, user);
    }
}
