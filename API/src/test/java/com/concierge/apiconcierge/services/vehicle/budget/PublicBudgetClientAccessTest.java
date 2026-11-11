package com.concierge.apiconcierge.services.vehicle.budget;
import com.concierge.apiconcierge.models.vehicle.budget.BudgetConcierge;
import com.concierge.apiconcierge.models.clientcompany.ClientCompany;
import com.concierge.apiconcierge.repositories.clientcompany.IClientCompanyRepository;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
class PublicBudgetClientAccessTest {
    @Test void grantsAccessOnlyForMatchingClientAndRevokesItWhenIdentityChanges() {
        var clients=mock(IClientCompanyRepository.class);var budget=new BudgetConcierge();budget.setId(15);budget.setCompanyId(1);budget.setResaleId(2);budget.setClientCompanyId(4);
        var client=new ClientCompany();client.setCpf("12345678901");when(clients.filterId(1,2,4)).thenReturn(client);
        var access=new PublicBudgetClientAccess(clients);var request=new MockHttpServletRequest();String token="a".repeat(43);
        assertFalse(access.allowed(token,budget,request));assertFalse(access.verify(token,budget,"00000000000",request));assertFalse(access.allowed(token,budget,request));
        assertTrue(access.verify(token,budget,"123.456.789-01",request));assertTrue(access.allowed(token,budget,request));
        client.setCpf("10987654321");assertFalse(access.allowed(token,budget,request));
    }
}
