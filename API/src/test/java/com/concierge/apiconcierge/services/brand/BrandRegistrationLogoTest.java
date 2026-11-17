package com.concierge.apiconcierge.services.brand;

import com.concierge.apiconcierge.models.brand.Brand;
import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.repositories.brand.IBrandRepository;
import com.concierge.apiconcierge.validation.brand.IBrandValidation;
import com.concierge.apiconcierge.util.ConstantsMessage;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BrandRegistrationLogoTest {
    @Mock IBrandRepository repository;
    @Mock IBrandValidation validation;
    @InjectMocks BrandService service;

    private MessageResponse success() { MessageResponse result = new MessageResponse(); result.setStatus(ConstantsMessage.SUCCESS); return result; }

    @Test void creationReturnsTheIdNeededForUploadingALogo() {
        Brand brand = new Brand(); brand.setName("Marca"); brand.setStatus(StatusEnableDisable.Habilitado);
        when(validation.save(brand)).thenReturn(success());
        when(repository.save(brand)).thenAnswer(call -> { brand.setId(7); return brand; });
        assertEquals(7, ((Brand) service.save(brand).getData()).getId());
    }

    @Test void updatingNameAndStatusPreservesTheStoredLogo() {
        Brand existing = new Brand(); existing.setId(7); existing.setName("Marca"); existing.setLogoUrl("/images/brands/7/branding/logo.png");
        Brand update = new Brand(); update.setId(7); update.setName("Marca atualizada"); update.setStatus(StatusEnableDisable.Habilitado);
        when(validation.update(update, "user")).thenReturn(success());
        when(repository.findById(7)).thenReturn(Optional.of(existing));
        when(repository.save(existing)).thenReturn(existing);
        Brand saved = (Brand) service.update(update, "user").getData();
        assertEquals("Marca atualizada", saved.getName());
        assertEquals("/images/brands/7/branding/logo.png", saved.getLogoUrl());
    }
}
