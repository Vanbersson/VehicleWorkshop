package com.concierge.apiconcierge.services.budget.part;

import com.concierge.apiconcierge.exceptions.budget.BudgetException;
import com.concierge.apiconcierge.models.budget.BudgetItemPart;
import com.concierge.apiconcierge.repositories.budget.IBudgetItemPartRepository;
import com.concierge.apiconcierge.util.ConstantsMessage;
import com.concierge.apiconcierge.validation.budget.part.IBudgetItemPartValidation;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BudgetItemPartService implements IBudgetItemPartService {
    @Autowired
    IBudgetItemPartRepository repository;

    @Autowired
    IBudgetItemPartValidation validation;

    @SneakyThrows
    @Override
    public String save(BudgetItemPart part) {
        try {
            String message = this.validation.save(part);
            if (ConstantsMessage.SUCCESS.equals(message)) {
                part.setId(null);
                this.repository.save(part);
                return ConstantsMessage.SUCCESS;
            } else {
                throw new BudgetException(message);
            }
        } catch (Exception ex) {
            throw new BudgetException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public String update(BudgetItemPart part) {
        try {
            String message = this.validation.update(part);
            if (ConstantsMessage.SUCCESS.equals(message)) {
                this.repository.save(part);
                return ConstantsMessage.SUCCESS;
            } else {
                throw new BudgetException(message);
            }
        } catch (Exception ex) {
            throw new BudgetException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public String delete(BudgetItemPart part) {
        try {
            String message = this.validation.delete(part);
            if (ConstantsMessage.SUCCESS.equals(message)) {
                this.repository.deleteItem(part.getCompanyId(), part.getResaleId(), part.getId());

                //Atualiza a ordem
                List<BudgetItemPart> list = this.repository.listAllParts(part.getCompanyId(), part.getResaleId(), part.getBudgetId());
                for (int i = 0; i < list.size(); i++) {
                    list.get(i).setOrdem(i + 1);
                    this.repository.save(list.get(i));
                }

                return ConstantsMessage.SUCCESS;
            } else {
                throw new BudgetException(message);
            }
        } catch (Exception ex) {
            throw new BudgetException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public String deleteAllDiscount(BudgetItemPart part) {
        try {
            String message = this.validation.update(part);
            if (ConstantsMessage.SUCCESS.equals(message)) {

                List<BudgetItemPart> list = this.repository.listAllParts(part.getCompanyId(), part.getResaleId(), part.getBudgetId());
                for (var item : list) {
                    item.setDiscount(0);
                    this.repository.save(item);
                }
                return ConstantsMessage.SUCCESS;
            } else {
                throw new BudgetException(message);
            }
        } catch (Exception ex) {
            throw new BudgetException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public List<BudgetItemPart> listAllParts(Integer companyId, Integer resaleId, Integer budgetId) {
        try {
            String message = this.validation.listAllParts(companyId, resaleId, budgetId);
            if (ConstantsMessage.SUCCESS.equals(message)) {
                return this.repository.listAllParts(companyId, resaleId, budgetId);
            } else {
                throw new BudgetException(message);
            }
        } catch (Exception ex) {
            throw new BudgetException(ex.getMessage());
        }
    }
}
