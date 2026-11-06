package com.concierge.apiconcierge.controllers.crm;
import com.concierge.apiconcierge.services.crm.attendance.*;
import com.concierge.apiconcierge.services.auth.TokenService;
import com.concierge.apiconcierge.models.crm.attendance.*;
import com.concierge.apiconcierge.models.clientcompany.ClientCompany;
import com.concierge.apiconcierge.repositories.crm.attendance.ICustomerAttendanceRepository;
import com.concierge.apiconcierge.repositories.clientcompany.IClientCompanyRepository;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import java.util.Optional;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
class PublicDocumentAccessControllerTest {
 @ParameterizedTest @ValueSource(strings={"proposals","orders"})
 void protectsPageFilesUploadAndApprovalBeforeVerification(String route) throws Exception {
  var proposals=mock(ProposalDocumentShareService.class);var orders=mock(OrderDocumentShareService.class);var document=new AttendanceDocument();document.setFileName("private-document.pdf");
  String token="a".repeat(43),url="/public/"+route+"/"+token;
  when(proposals.page(token)).thenReturn(document);when(orders.page(token)).thenReturn(document);
  var access=new PublicDocumentClientAccess(mock(ICustomerAttendanceRepository.class),mock(IClientCompanyRepository.class));
  Object controller=route.equals("proposals") ? new ProposalDocumentShareController(proposals,mock(TokenService.class),access) : new OrderDocumentShareController(orders,mock(TokenService.class),access);
  var mvc=MockMvcBuilders.standaloneSetup(controller,new PublicApprovalPageController(proposals,orders,access)).build();
  mvc.perform(get(url+"/data")).andExpect(status().isOk()).andExpect(jsonPath("$.accessRequired").value(true)).andExpect(content().string(not(containsString("private-document.pdf"))));
  mvc.perform(get(url+"/file")).andExpect(status().isForbidden());
  mvc.perform(get(url+"/signed")).andExpect(status().isForbidden());
  mvc.perform(post(url+"/approve").param("confirmed","true")).andExpect(status().isForbidden());
  mvc.perform(multipart(url+"/signed").file(new MockMultipartFile("file","signed.pdf","application/pdf","%PDF-test".getBytes()))).andExpect(status().isForbidden());
  mvc.perform(post(url+"/confirm").contentType("application/json").content("{\"confirmed\":true}")).andExpect(status().isForbidden());
  mvc.perform(multipart(url+"/signed-upload").file(new MockMultipartFile("file","signed.pdf","application/pdf","%PDF-test".getBytes()))).andExpect(status().isForbidden());
  verify(proposals,never()).approve(anyString(),anyBoolean());verify(orders,never()).approve(anyString(),anyBoolean());verify(proposals,never()).view(anyString());verify(orders,never()).view(anyString());
 }
 @ParameterizedTest @ValueSource(strings={"proposals","orders"})
 void permitsDownloadAfterMatchingClientDocument(String route) throws Exception {
  var proposals=mock(ProposalDocumentShareService.class);var orders=mock(OrderDocumentShareService.class);var document=new AttendanceDocument();document.setAttendanceId(42);document.setFileName("private.pdf");document.setContentType("application/pdf");document.setSize(9L);
  String token="a".repeat(43),url="/public/"+route+"/"+token;
  when(proposals.page(token)).thenReturn(document);when(orders.page(token)).thenReturn(document);
  var data=new AttendanceDocumentService.Download(document,"%PDF-test".getBytes());when(proposals.view(token)).thenReturn(data);when(orders.view(token)).thenReturn(data);
  var attendances=mock(ICustomerAttendanceRepository.class);var clients=mock(IClientCompanyRepository.class);var attendance=new CustomerAttendance();attendance.setId(42);attendance.setCompanyId(1);attendance.setResaleId(2);attendance.setClientId(7);var client=new ClientCompany();client.setCpf("12345678901");when(attendances.findById(42)).thenReturn(Optional.of(attendance));when(clients.filterId(1,2,7)).thenReturn(client);
  var access=new PublicDocumentClientAccess(attendances,clients);Object controller=route.equals("proposals") ? new ProposalDocumentShareController(proposals,mock(TokenService.class),access) : new OrderDocumentShareController(orders,mock(TokenService.class),access);var mvc=MockMvcBuilders.standaloneSetup(controller,new PublicApprovalPageController(proposals,orders,access)).build();
  mvc.perform(post(url+"/verify").contentType("application/json").content("{\"taxId\":\"00000000000\"}")).andExpect(status().isForbidden());
  var result=mvc.perform(post(url+"/verify").contentType("application/json").content("{\"taxId\":\"123.456.789-01\"}")).andExpect(status().isOk()).andExpect(jsonPath("$.accessRequired").value(false)).andReturn();
  var session=(MockHttpSession)result.getRequest().getSession(false);
  mvc.perform(get(url+"/file").session(session)).andExpect(status().isOk()).andExpect(content().bytes(data.content()));
 }
}
