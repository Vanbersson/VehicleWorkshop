package com.concierge.apiconcierge.services.budget.requisition;

import com.concierge.apiconcierge.exceptions.budget.BudgetException;
import com.concierge.apiconcierge.models.budget.BudgetItemRequisition;
import com.concierge.apiconcierge.repositories.budget.IBudgetItemRequisitionRepository;
import com.concierge.apiconcierge.util.ConstantsMessage;
import com.concierge.apiconcierge.validation.budget.requisition.IBudgetItemRequisitionValidation;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BudgetItemRequisitionService implements IBudgetItemRequisitionService {
    @Autowired
    private IBudgetItemRequisitionRepository repository;

    @Autowired
    private IBudgetItemRequisitionValidation validation;

    @SneakyThrows
    @Override
    public String save(BudgetItemRequisition requisition) {
        try {
            String message = this.validation.save(requisition);
            if (ConstantsMessage.SUCCESS.equals(message)) {
                requisition.setId(null);
                this.repository.save(requisition);
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
    public String update(BudgetItemRequisition requisition) {
        try {
            String message = this.validation.update(requisition);
            if (ConstantsMessage.SUCCESS.equals(message)) {
                this.repository.save(requisition);
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
    public String delete(BudgetItemRequisition requisition) {
        try {
            String message = this.validation.delete(requisition);
            if (ConstantsMessage.SUCCESS.equals(message)) {
                this.repository.deleteRequisition(requisition.getCompanyId(), requisition.getResaleId(), requisition.getId());

                //Atualiza ordem
                List<BudgetItemRequisition> list = this.repository.listAllRequisition(requisition.getCompanyId(), requisition.getResaleId(), requisition.getBudgetId());
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
    public List<BudgetItemRequisition> listAllRequisition(Integer companyId, Integer resaleId, Integer budgetId) {
        try {
            String message = this.validation.listAllRequisition(companyId, resaleId, budgetId);
            if (ConstantsMessage.SUCCESS.equals(message)) {
                return this.repository.listAllRequisition(companyId, resaleId, budgetId);
            } else {
                throw new BudgetException(message);
            }
        } catch (Exception ex) {
            throw new BudgetException(ex.getMessage());
        }
    }
}
