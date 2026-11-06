package com.concierge.apiconcierge.services.crm.attendance;
import com.concierge.apiconcierge.models.crm.attendance.*;
import com.concierge.apiconcierge.models.clientcompany.ClientCompany;
import com.concierge.apiconcierge.repositories.crm.attendance.ICustomerAttendanceRepository;
import com.concierge.apiconcierge.repositories.clientcompany.IClientCompanyRepository;
import org.junit.jupiter.api.*;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.server.ResponseStatusException;
import java.util.Optional;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
class PublicDocumentClientAccessTest {
 ICustomerAttendanceRepository attendances;IClientCompanyRepository clients;PublicDocumentClientAccess service;AttendanceDocument document;CustomerAttendance attendance;ClientCompany client;
 @BeforeEach void setup(){attendances=mock(ICustomerAttendanceRepository.class);clients=mock(IClientCompanyRepository.class);service=new PublicDocumentClientAccess(attendances,clients);document=new AttendanceDocument();document.setAttendanceId(42);attendance=new CustomerAttendance();attendance.setId(42);attendance.setCompanyId(1);attendance.setResaleId(2);attendance.setClientId(7);client=new ClientCompany();client.setCpf("12345678901");client.setCnpj("11222333000144");when(attendances.findById(42)).thenReturn(Optional.of(attendance));when(clients.filterId(1,2,7)).thenReturn(client);}
 @Test void grantsAccessForFormattedCnpjOnlyToTheVerifiedLink(){var request=new MockHttpServletRequest();assertFalse(service.allowed("token",document,request));assertTrue(service.verify("token",document,"11.222.333/0001-44",request));assertTrue(service.allowed("token",document,request));assertFalse(service.allowed("another-token",document,request));}
 @Test void acceptsCpfAndRevokesAccessWhenClientDataChanges(){var request=new MockHttpServletRequest();assertTrue(service.verify("token",document,"123.456.789-01",request));assertTrue(service.allowed("token",document,request));client.setCpf("98765432100");assertFalse(service.allowed("token",document,request));}
 @Test void rejectsMissingWrongAndMalformedDocuments(){var request=new MockHttpServletRequest();for(String value:new String[]{"","00000000000","letters12345678901"})assertFalse(service.verify("token",document,value,request));assertFalse(service.allowed("token",document,request));assertThrows(ResponseStatusException.class,()->service.require("token",document,request));}
 @Test void requiresARegisteredClient(){attendance.setClientId(null);assertFalse(service.verify("token",document,"12345678901",new MockHttpServletRequest()));}
 @Test void limitsIncorrectAttemptsEvenAcrossSessions(){for(int i=0;i<10;i++)assertFalse(service.verify("token",document,"00000000000",new MockHttpServletRequest()));var error=assertThrows(ResponseStatusException.class,()->service.verify("token",document,"12345678901",new MockHttpServletRequest()));assertEquals(429,error.getStatusCode().value());}
}
