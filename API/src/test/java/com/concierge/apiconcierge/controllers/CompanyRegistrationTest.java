package com.concierge.apiconcierge.controllers;
import com.concierge.apiconcierge.dtos.ResaleDto;
import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.resales.Resale;
import com.concierge.apiconcierge.repositories.CompanyRepository;
import com.concierge.apiconcierge.repositories.ResaleRepository;
import com.concierge.apiconcierge.repositories.brand.IBrandRepository;
import com.concierge.apiconcierge.models.brand.Brand;
import java.util.Optional;
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
 @Mock IBrandRepository brandRepository;
 @InjectMocks ResaleController controller;
 private ResaleDto data(Integer id) { return data(id, null); }
 private ResaleDto data(Integer id, Integer brandId) { return new ResaleDto(1, id, StatusEnableDisable.Habilitado, "Unidade", "12345678000190", "", "", "", "01001000", "SP", "Cidade", "Centro", "Rua", "1", "", "123456789", brandId); }
 @Test void updateRouteAcceptsCompanyFromBodyWithoutPathVariable() throws Exception {
  Resale resale = new Resale(); resale.setId(8); resale.setCompanyId(1);
  when(resaleRepository.findByCompanyIdAndId(1, 8)).thenReturn(resale);
  when(resaleRepository.save(resale)).thenReturn(resale);
  var mvc = MockMvcBuilders.standaloneSetup(controller).build();
  mvc.perform(post("/resale/update").contentType(MediaType.APPLICATION_JSON).content(new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(data(8)))).andExpect(status().isOk());
  verify(resaleRepository).save(resale);
  assertEquals("123456789", resale.getIe()); assertEquals("Unidade", resale.getName()); assertEquals(1, resale.getCompanyId());
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
 @Test void savesTheRepresentedBrandWhenCreatingAResale() {
  when(companyRepository.existsById(1)).thenReturn(true);
  Brand brand = new Brand(); brand.setId(7); brand.setStatus(StatusEnableDisable.Habilitado);
  when(brandRepository.findById(7)).thenReturn(Optional.of(brand));
  when(resaleRepository.save(any())).thenAnswer(call -> call.getArgument(0));
  var response = controller.saveResale(data(null, 7));
  assertEquals(201, response.getStatusCode().value());
  assertEquals(7, ((Resale) response.getBody()).getBrandId());
 }
 @Test void rejectsMissingOrDisabledBrandOnCreation() {
  when(companyRepository.existsById(1)).thenReturn(true);
  when(brandRepository.findById(99)).thenReturn(Optional.empty());
  assertEquals(400, controller.saveResale(data(null, 99)).getStatusCode().value());
  Brand brand = new Brand(); brand.setId(7); brand.setStatus(StatusEnableDisable.Desabilitado);
  when(brandRepository.findById(7)).thenReturn(Optional.of(brand));
  assertEquals(400, controller.saveResale(data(null, 7)).getStatusCode().value());
  verify(resaleRepository, never()).save(any());
 }
 @Test void keepsAnExistingDisabledBrandAndAllowsClearingIt() {
  Resale resale = new Resale(); resale.setId(8); resale.setCompanyId(1); resale.setBrandId(7);
  Brand brand = new Brand(); brand.setId(7); brand.setStatus(StatusEnableDisable.Desabilitado);
  when(resaleRepository.findByCompanyIdAndId(1, 8)).thenReturn(resale);
  when(resaleRepository.save(resale)).thenReturn(resale);
  when(brandRepository.findById(7)).thenReturn(Optional.of(brand));
  assertEquals(200, controller.updateResale(data(8, 7)).getStatusCode().value());
  assertEquals(7, resale.getBrandId());
  assertEquals(200, controller.updateResale(data(8)).getStatusCode().value());
  assertNull(resale.getBrandId());
 }
}
