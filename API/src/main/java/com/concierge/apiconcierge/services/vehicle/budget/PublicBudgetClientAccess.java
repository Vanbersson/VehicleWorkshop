package com.concierge.apiconcierge.services.vehicle.budget;
import com.concierge.apiconcierge.models.vehicle.budget.BudgetConcierge;
import com.concierge.apiconcierge.repositories.clientcompany.IClientCompanyRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PublicBudgetClientAccess {
 private final IClientCompanyRepository clients;
 private final Map<String,Attempts> attempts=new ConcurrentHashMap<>();
 private record Grant(String binding,Instant expires) implements java.io.Serializable {}
 private static class Attempts { final Instant until=Instant.now().plusSeconds(600); int count; }
 public PublicBudgetClientAccess(IClientCompanyRepository clients){this.clients=clients;}
 private String hash(String value) {
  try{return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));}
  catch(NoSuchAlgorithmException error){throw new IllegalStateException(error);}
 }
 private String digits(String value){return value==null ? "" : value.replaceAll("[^0-9]","");}
 private record ClientDocuments(String cpf,String cnpj,String binding) {}
 private ClientDocuments clientDocuments(BudgetConcierge budget) {
  if(budget==null || budget.getClientCompanyId()==null)return null;
  var client=clients.filterId(budget.getCompanyId(),budget.getResaleId(),budget.getClientCompanyId());
  if(client==null)return null;
  String cpf=digits(client.getCpf()),cnpj=digits(client.getCnpj());
  return new ClientDocuments(cpf,cnpj,hash(budget.getId()+":"+budget.getClientCompanyId()+":"+cpf+":"+cnpj));
 }
 @Transactional(readOnly=true)
 public boolean allowed(String token,BudgetConcierge budget,HttpServletRequest request) {
  var session=request.getSession(false);if(session==null)return false;
  var value=session.getAttribute("concierge-budget-access:"+hash(token));
  if(!(value instanceof Grant grant) || !grant.expires().isAfter(Instant.now()))return false;
  var client=clientDocuments(budget);
  return client!=null && grant.binding().equals(client.binding());
 }
 @Transactional(readOnly=true)
 public boolean verify(String token,BudgetConcierge budget,String taxId,HttpServletRequest request) {
  String key=hash(token);
  attempts.entrySet().removeIf(entry->!entry.getValue().until.isAfter(Instant.now()));
  if(attempts.size()>=10000 && !attempts.containsKey(key))throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,"Tente novamente mais tarde.");
  Attempts counter=attempts.computeIfAbsent(key,ignored->new Attempts());
  synchronized(counter) {
   if(counter.count>=10)throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,"Muitas tentativas. Aguarde 10 minutos e tente novamente.");
   counter.count++;
   var client=clientDocuments(budget);
   String supplied=taxId==null || taxId.length()>32 || !taxId.matches("[0-9.\\s/\\-]+") ? "" : digits(taxId);
   boolean matches=client!=null && ((supplied.length()==11 && supplied.equals(client.cpf())) || (supplied.length()==14 && supplied.equals(client.cnpj())));
   if(!matches)return false;
   var session=request.getSession();request.changeSessionId();
   session.setAttribute("concierge-budget-access:"+key,new Grant(client.binding(),Instant.now().plusSeconds(1800)));
   attempts.remove(key,counter);
   return true;
  }
 }
 public void require(String token,BudgetConcierge budget,HttpServletRequest request) {
  if(!allowed(token,budget,request))throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Informe o CNPJ ou CPF do cliente na pagina de acesso antes de continuar.");
 }
}
