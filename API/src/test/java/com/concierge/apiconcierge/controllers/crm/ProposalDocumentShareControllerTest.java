package com.concierge.apiconcierge.controllers.crm;
import com.concierge.apiconcierge.services.crm.attendance.*;
import com.concierge.apiconcierge.services.auth.TokenService;
import com.concierge.apiconcierge.models.crm.attendance.AttendanceDocument;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.http.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

class ProposalDocumentShareControllerTest {
 @Test void usesTheApiContextForDownloadAndApproval() throws Exception {
  var service=mock(ProposalDocumentShareService.class);var doc=new AttendanceDocument();doc.setFileName("proposta.pdf");doc.setContentType("application/pdf");doc.setSignedFilePath("signed.pdf");doc.setSignedFileName("assinada.pdf");
  String token="a".repeat(43);when(service.page(token)).thenReturn(doc);
  var access=mock(PublicDocumentClientAccess.class);
  when(access.allowed(org.mockito.ArgumentMatchers.anyString(),org.mockito.ArgumentMatchers.any(),org.mockito.ArgumentMatchers.any())).thenReturn(true);
  var mvc=MockMvcBuilders.standaloneSetup(new ProposalDocumentShareController(service,mock(TokenService.class),access)).build();
  mvc.perform(get("/atena-api-v2/public/proposals/"+token).contextPath("/atena-api-v2"))
   .andExpect(status().isSeeOther()).andExpect(header().string("Location","http://localhost:4200/public/proposals/"+token));
 }
 @Test void downloadsPdfWithOriginalBytesAndFilename() throws Exception {
  var service=mock(ProposalDocumentShareService.class);var doc=new AttendanceDocument();doc.setFileName("proposta.pdf");doc.setContentType("application/pdf");byte[] bytes="%PDF-test".getBytes();doc.setSize((long)bytes.length);
  String token="a".repeat(43);when(service.view(token)).thenReturn(new AttendanceDocumentService.Download(doc,bytes));
  var mvc=MockMvcBuilders.standaloneSetup(new ProposalDocumentShareController(service,mock(TokenService.class),mock(PublicDocumentClientAccess.class))).build();
  mvc.perform(get("/public/proposals/"+token+"/file"))
   .andExpect(status().isOk()).andExpect(content().contentType(MediaType.APPLICATION_PDF)).andExpect(content().bytes(bytes))
   .andExpect(header().string("X-Frame-Options","SAMEORIGIN")).andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION,startsWith("attachment;")));
 }
}
