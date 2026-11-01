package com.concierge.apiconcierge.validation.workshop.toolcontrol.material;

import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.workshop.toolcontrol.ToolControlCategory;
import com.concierge.apiconcierge.models.workshop.toolcontrol.ToolControlMaterial;
import com.concierge.apiconcierge.models.workshop.toolcontrol.enums.TypeCategory;
import com.concierge.apiconcierge.models.workshop.toolcontrol.enums.TypeRequest;
import com.concierge.apiconcierge.repositories.workshop.toolcontrol.IToolControlCategoryRepository;
import com.concierge.apiconcierge.util.ConstantsMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class ToolControlMaterialValidation implements IToolControlMaterialValidation {

    @Autowired
    IToolControlCategoryRepository categoryRepository;

    private MessageResponse failure(String message) {MessageResponse r=new MessageResponse();r.setStatus(ConstantsMessage.ERROR);r.setHeader("Material");r.setMessage(message);return r;}
    @Override
    public MessageResponse save(ToolControlMaterial mat) {return validate(mat,false);}
    @Override
    public MessageResponse update(ToolControlMaterial mat) {return validate(mat,true);}
    private MessageResponse validate(ToolControlMaterial mat,boolean update) {
        if(mat==null || mat.getCompanyId()==null || mat.getCompanyId()<=0 || mat.getResaleId()==null || mat.getResaleId()<=0) return failure("Empresa e revenda devem ser informadas.");
        if(update && (mat.getId()==null || mat.getId()<=0)) return failure("Código do material inválido.");
        if(mat.getStatus()==null || mat.getType()==null) return failure("Informe o status e o tipo de requisição.");
        if(mat.getDescription()==null || mat.getDescription().isBlank() || mat.getDescription().length()>255) return failure("Descrição inválida.");
        if(mat.getCategoryId()==null || mat.getCategoryId()<=0) return failure("Informe a categoria.");
        BigDecimal[] values={mat.getQuantityAccountingLoan(),mat.getQuantityAvailableLoan(),mat.getQuantityAccountingKit(),mat.getQuantityAvailableKit()};
        for(BigDecimal value:values) if(value==null || value.signum()<0) return failure("As quantidades devem ser informadas e não podem ser negativas.");
        if(!update && (mat.getQuantityAvailableLoan().compareTo(mat.getQuantityAccountingLoan())>0 || mat.getQuantityAvailableKit().compareTo(mat.getQuantityAccountingKit())>0)) return failure("Quantidade disponível maior que a contábil.");
        if((mat.getNumberCA()!=null && mat.getNumberCA()<0) || (mat.getValidityDay()!=null && mat.getValidityDay()<0)) return failure("C.A. e validade não podem ser negativos.");
        ToolControlCategory category=categoryRepository.filterId(mat.getCompanyId(),mat.getResaleId(),mat.getCategoryId());
        if(category==null || category.getType()==null) return failure("Categoria não encontrada nesta revenda.");
        if((category.getType()==TypeCategory.EPI || category.getType()==TypeCategory.Uniforme) && mat.getType()!=TypeRequest.Loan) return failure("EPI e uniforme devem usar o tipo empréstimo.");
        MessageResponse response=new MessageResponse();response.setStatus(ConstantsMessage.SUCCESS);response.setHeader("Material");response.setMessage(update?"Atualizado com sucesso.":"Cadastrado com sucesso.");return response;
    }



    @Override
    public MessageResponse filterId(Integer companyId, Integer resaleId, Integer id) {
        MessageResponse response = new MessageResponse();
        if (companyId == null || companyId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (resaleId == null || resaleId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (id == null || id == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Código");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Material");
        response.setMessage("Encontrado com sucesso.");
        return response;
    }

    @Override
    public MessageResponse listAll(Integer companyId, Integer resaleId) {
        MessageResponse response = new MessageResponse();
        if (companyId == null || companyId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (resaleId == null || resaleId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Material");
        response.setMessage("Encontrado com sucesso.");
        return response;
    }

    @Override
    public MessageResponse listAllEnabled(Integer companyId, Integer resaleId) {
        MessageResponse response = new MessageResponse();
        if (companyId == null || companyId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Empresa");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        if (resaleId == null || resaleId == 0) {
            response.setStatus(ConstantsMessage.ERROR);
            response.setHeader("Revenda");
            response.setMessage(ConstantsMessage.NOT_INFORMED);
            return response;
        }
        response.setStatus(ConstantsMessage.SUCCESS);
        response.setHeader("Material");
        response.setMessage("Encontrado com sucesso.");
        return response;
    }
}
