package com.concierge.apiconcierge.services.vehicle.budget;
import com.concierge.apiconcierge.models.vehicle.budget.*;
import com.concierge.apiconcierge.repositories.vehicle.budget.IBudgetConciergeDocumentRepository;
import com.concierge.apiconcierge.exceptions.BusinessException;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
@ExtendWith(MockitoExtension.class)
class BudgetConciergeDocumentServiceTest {
    @Mock BudgetConciergeService budgets;
    @Mock IBudgetConciergeDocumentRepository documents;
    @Mock BudgetConciergeDocumentStorage storage;
    @InjectMocks BudgetConciergeDocumentService service;
    @Test void rejectsImagesDisguisedAsPdfWithoutWritingFiles() {
        assertThrows(BusinessException.class,()->service.upload(1,2,15,new MockMultipartFile("file","bad.pdf","application/pdf","image".getBytes()),"user"));
        verify(budgets).documentScope(1,2,15,"user",true);verifyNoInteractions(storage);verify(documents,never()).saveAndFlush(any());
    }
    @Test void storesPdfWithTenantAndBudgetMetadata() throws Exception {
        when(storage.save(eq(1),eq(2),eq(15),eq("pdf"),any())).thenReturn("private/file.pdf");when(documents.saveAndFlush(any())).thenAnswer(call->call.getArgument(0));
        TransactionSynchronizationManager.initSynchronization();
        try {
            var result=service.upload(1,2,15,new MockMultipartFile("file","orcamento.pdf","application/pdf","%PDF-test".getBytes()),"user");
            assertEquals(1,result.getCompanyId());assertEquals(2,result.getResaleId());assertEquals(15,result.getBudgetId());assertEquals("application/pdf",result.getContentType());assertEquals("orcamento.pdf",result.getFileName());assertNotNull(result.getCreatedAt());
        } finally {TransactionSynchronizationManager.clearSynchronization();}
    }
    @Test void authorizationFailureStopsFileAccess() {
        doThrow(new BusinessException("Acesso negado")).when(budgets).documentScope(1,2,15,"user",false);
        assertThrows(BusinessException.class,()->service.download(1,2,15,3,"user"));verifyNoInteractions(documents,storage);
    }
    @Test void preventsDuplicateAttachments() {
        when(documents.existsByBudgetId(15)).thenReturn(true);
        assertThrows(BusinessException.class,()->service.upload(1,2,15,new MockMultipartFile("file","orcamento.pdf","application/pdf","%PDF-test".getBytes()),"user"));verifyNoInteractions(storage);
    }

    @Test void removingApprovedPdfReopensBudgetAndClearsAuthorizationDate() {
        var budget=new BudgetConcierge();budget.setStatus(com.concierge.apiconcierge.models.budget.enums.StatusBudgetEnum.Approved);budget.setDateAuthorization(java.time.LocalDateTime.now());
        var document=new BudgetConciergeDocument();document.setFilePath("private/file.pdf");
        when(budgets.documentScope(1,2,15,"user",true)).thenReturn(budget);doCallRealMethod().when(budgets).resetApproval(budget);
        when(documents.findByCompanyIdAndResaleIdAndBudgetIdAndId(1,2,15,3)).thenReturn(java.util.Optional.of(document));
        TransactionSynchronizationManager.initSynchronization();
        try {service.remove(1,2,15,3,"user");assertEquals(com.concierge.apiconcierge.models.budget.enums.StatusBudgetEnum.OpenBudget,budget.getStatus());assertNull(budget.getDateAuthorization());verify(documents).delete(document);}
        finally {TransactionSynchronizationManager.clearSynchronization();}
    }
}
