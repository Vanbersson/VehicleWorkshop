package com.concierge.apiconcierge.controllers.brand;

import com.concierge.apiconcierge.models.brand.Brand;
import com.concierge.apiconcierge.models.user.User;
import com.concierge.apiconcierge.services.brand.BrandLogoService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/brand/{brandId}/logo")
public class BrandLogoController {
    private final BrandLogoService service;

    public BrandLogoController(BrandLogoService service) {
        this.service = service;
    }

    @PostMapping(consumes = "multipart/form-data")
    public Brand save(@PathVariable Integer brandId,
                       @RequestParam("file") MultipartFile file, @AuthenticationPrincipal User user) {
        return service.save(brandId, file, user);
    }

    @PostMapping("/delete")
    public Brand remove(@PathVariable Integer brandId,
                         @AuthenticationPrincipal User user) {
        return service.remove(brandId, user);
    }
}
