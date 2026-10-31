package com.concierge.apiconcierge.controllers;
import com.concierge.apiconcierge.dtos.ResaleDto;
import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.resales.Resale;
import com.concierge.apiconcierge.repositories.CompanyRepository;
import com.concierge.apiconcierge.repositories.ResaleRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.http.MediaType;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
@ExtendWith(MockitoExtension.class)
class CompanyRegistrationTest {
 @Mock ResaleRepository resaleRepository;
 @Mock CompanyRepository companyRepository;
 @InjectMocks ResaleController controller;
 private ResaleDto data(Integer id) { return new ResaleDto(1, id, StatusEnableDisable.Habilitado, "Unidade", "12345678000190", "", "", "", "01001000", "SP", "Cidade", "Centro", "Rua", "1", ""); }
 @Test void updateRouteAcceptsCompanyFromBodyWithoutPathVariable() throws Exception {
  Resale resale = new Resale(); resale.setId(8); resale.setCompanyId(1);
  when(resaleRepository.findByCompanyIdAndId(1, 8)).thenReturn(resale);
  when(resaleRepository.save(resale)).thenReturn(resale);
  var mvc = MockMvcBuilders.standaloneSetup(controller).build();
  mvc.perform(post("/resale/update").contentType(MediaType.APPLICATION_JSON).content(new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(data(8)))).andExpect(status().isOk());
  verify(resaleRepository).save(resale);
  assertEquals("Unidade", resale.getName()); assertEquals(1, resale.getCompanyId());
 }
 @Test void cannotCreateResaleWithMissingCompany() {
  assertEquals(404, controller.saveResale(data(null)).getStatusCode().value());
  verify(resaleRepository, never()).save(any());
 }
 @Test void rejectsDuplicateCnpjWhenEditingAResale() {
  Resale existing = new Resale(); existing.setId(9);
  when(resaleRepository.findByCompanyIdAndCnpj(1, "12345678000190")).thenReturn(existing);
  assertEquals(409, controller.updateResale(data(8)).getStatusCode().value());
  verify(resaleRepository, never()).save(any());
 }
}
