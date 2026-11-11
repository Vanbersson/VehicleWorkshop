package com.concierge.apiconcierge.services.vehicle.budget;
import com.concierge.apiconcierge.models.vehicle.budget.*;
import com.concierge.apiconcierge.models.budget.enums.StatusBudgetEnum;
import com.concierge.apiconcierge.repositories.vehicle.budget.*;
import com.concierge.apiconcierge.repositories.vehicle.entry.IVehicleEntryRepository;
import com.concierge.apiconcierge.repositories.clientcompany.IClientCompanyRepository;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;
import jakarta.servlet.http.HttpServletRequest;
import java.util.*;
import java.time.*;
import java.math.BigDecimal;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
@ExtendWith(MockitoExtension.class)
class BudgetConciergeApprovalServiceTest {
    @Mock BudgetConciergeService scope; @Mock IBudgetConciergeRepository budgets; @Mock IBudgetConciergeDocumentRepository documents;
    @Mock IVehicleEntryRepository vehicles; @Mock IClientCompanyRepository clients; @Mock BudgetConciergeDocumentStorage storage; @Mock PublicBudgetClientAccess access; @Mock HttpServletRequest request;
    @InjectMocks BudgetConciergeApprovalService service;
    private BudgetConcierge budget;private BudgetConciergeDocument document;private final String token="a".repeat(43);
    @BeforeEach void setup() {
        budget=new BudgetConcierge();budget.setId(15);budget.setCompanyId(1);budget.setResaleId(2);budget.setClientCompanyId(4);budget.setClientCompanyName("Cliente");budget.setVehicleId(7);budget.setStatus(StatusBudgetEnum.OpenBudget);
        var item=new BudgetConciergeItem();item.setType(1);item.setDescription("Reparo");item.setQuantity(new BigDecimal("99"));item.setHourService(new BigDecimal("1.5"));item.setPrice(new BigDecimal("100"));item.setDiscount(new BigDecimal("10"));budget.getItems().add(item);
        document=new BudgetConciergeDocument();document.setBudgetId(15);document.setCompanyId(1);document.setResaleId(2);document.setFileName("orcamento.pdf");document.setSize(100L);document.setShareExpiresAt(Instant.now().plusSeconds(3600));
        lenient().when(documents.findByShareTokenHash(anyString())).thenReturn(Optional.of(document));lenient().when(budgets.findById(15)).thenReturn(Optional.of(budget));
    }
    @Test void hidesClientItemsAndPdfUntilIdentityIsVerified() {
        var result=service.data(token,request);assertTrue(result.accessRequired());assertNull(result.clientName());assertNull(result.fileName());assertNull(result.total());assertTrue(result.items().isEmpty());verifyNoInteractions(vehicles,storage);
    }
    @Test void includesServiceTotalWithoutQuantityAfterVerification() {
        when(access.allowed(token,budget,request)).thenReturn(true);var result=service.data(token,request);assertFalse(result.accessRequired());assertEquals(0,new BigDecimal("140").compareTo(result.total()));
    }
    @Test void deniesExpiredLinksAndUnconfirmedApprovals() {
        document.setShareExpiresAt(Instant.now().minusSeconds(1));assertThrows(ResponseStatusException.class,()->service.data(token,request));assertThrows(ResponseStatusException.class,()->service.approve(token,false,request));verifyNoInteractions(access,storage);verify(documents,never()).saveAndFlush(any());
    }
    @Test void approvalIsAtomicAndIdempotent() {
        var binding=mock(IBudgetConciergeDocumentRepository.ApprovalScope.class);when(binding.getCompanyId()).thenReturn(1);when(binding.getResaleId()).thenReturn(2);when(binding.getBudgetId()).thenReturn(15);
        when(documents.shareScope(anyString())).thenReturn(Optional.of(binding));when(budgets.lockBudget(1,2,15)).thenReturn(Optional.of(budget));when(documents.lockForApproval(anyString())).thenReturn(Optional.of(document));
        service.approve(token,true,request);Instant first=document.getApprovedAt();service.approve(token,true,request);
        assertNotNull(first);assertEquals(first,document.getApprovedAt());assertNotNull(budget.getDateAuthorization());assertEquals(StatusBudgetEnum.Approved,budget.getStatus());verify(documents,times(1)).saveAndFlush(document);verify(budgets,times(1)).saveAndFlush(budget);verify(access,times(2)).require(token,budget,request);
    }
    @Test void preventsPdfAccessWithoutIdentityConfirmation() {
        doThrow(new ResponseStatusException(org.springframework.http.HttpStatus.FORBIDDEN)).when(access).require(token,budget,request);
        assertThrows(ResponseStatusException.class,()->service.download(token,request));verifyNoInteractions(storage);
    }
}
