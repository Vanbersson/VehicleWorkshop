package com.concierge.apiconcierge.services.vehicle.budget;
import com.concierge.apiconcierge.models.vehicle.budget.BudgetConciergeDocument;
import com.concierge.apiconcierge.repositories.vehicle.budget.IBudgetConciergeDocumentRepository;
import com.concierge.apiconcierge.exceptions.BusinessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import java.io.IOException;
import java.time.LocalDateTime;
import java.nio.charset.StandardCharsets;
import java.util.*;
@Service
public class BudgetConciergeDocumentService {
    private final BudgetConciergeService budgets;
    private final IBudgetConciergeDocumentRepository documents;
    private final BudgetConciergeDocumentStorage storage;
    public BudgetConciergeDocumentService(BudgetConciergeService budgets,IBudgetConciergeDocumentRepository documents,BudgetConciergeDocumentStorage storage) { this.budgets=budgets; this.documents=documents; this.storage=storage; }
    @Transactional(readOnly=true)
    public List<BudgetConciergeDocument> list(Integer company,Integer resale,Integer budget,String email) {
        budgets.documentScope(company,resale,budget,email,false);
        return documents.findByCompanyIdAndResaleIdAndBudgetId(company,resale,budget);
    }
    @Transactional(rollbackFor=IOException.class)
    public BudgetConciergeDocument upload(Integer company,Integer resale,Integer budget,MultipartFile file,String email) throws IOException {
        var scope=budgets.documentScope(company,resale,budget,email,true);
        if(documents.existsByBudgetId(budget)) throw new BusinessException("Remova o documento atual antes de adicionar outro PDF.");
        if(file.isEmpty() || file.getSize()>5L*1024*1024) throw new BusinessException("Envie um PDF de ate 5 MB.");
        String raw=Optional.ofNullable(file.getOriginalFilename()).orElse("").replace('\\','/');
        String name=raw.substring(raw.lastIndexOf('/')+1).replaceAll("[\\p{Cntrl}]", "").trim();
        byte[] bytes=file.getBytes();
        if(name.isBlank() || name.length()>255 || !name.toLowerCase(Locale.ROOT).endsWith(".pdf") || bytes.length<5 || !new String(bytes,0,5,StandardCharsets.US_ASCII).equals("%PDF-")) throw new BusinessException("Envie um arquivo PDF valido.");
        String path=storage.save(company,resale,budget,"pdf",bytes);
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override public void afterCompletion(int status) { if(status==STATUS_ROLLED_BACK) cleanup(path); }
        });
        var item=new BudgetConciergeDocument(); item.setCompanyId(company); item.setResaleId(resale); item.setBudgetId(budget); item.setFileName(name); item.setContentType("application/pdf"); item.setSize((long)bytes.length); item.setFilePath(path); item.setCreatedAt(LocalDateTime.now());
        try { var saved=documents.saveAndFlush(item); budgets.resetApproval(scope); return saved; } catch(RuntimeException error) { cleanup(path); throw error; }
    }
    private BudgetConciergeDocument find(Integer company,Integer resale,Integer budget,Integer id) {
        return documents.findByCompanyIdAndResaleIdAndBudgetIdAndId(company,resale,budget,id).orElseThrow(()->new ResponseStatusException(HttpStatus.NOT_FOUND,"Documento nao encontrado neste orcamento."));
    }
    public record Download(BudgetConciergeDocument metadata,byte[] bytes) {}
    @Transactional(readOnly=true)
    public Download download(Integer company,Integer resale,Integer budget,Integer id,String email) throws IOException {
        budgets.documentScope(company,resale,budget,email,false); var item=find(company,resale,budget,id); return new Download(item,storage.read(item.getFilePath()));
    }
    @Transactional
    public void remove(Integer company,Integer resale,Integer budget,Integer id,String email) {
        var scope=budgets.documentScope(company,resale,budget,email,true); var item=find(company,resale,budget,id); documents.delete(item); documents.flush(); budgets.resetApproval(scope);
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() { @Override public void afterCommit() { cleanup(item.getFilePath()); } });
    }
    private void cleanup(String path) {
        try { storage.delete(path); } catch(IOException error) { org.slf4j.LoggerFactory.getLogger(BudgetConciergeDocumentService.class).error("Falha ao remover arquivo de documento do orcamento",error); }
    }
}
