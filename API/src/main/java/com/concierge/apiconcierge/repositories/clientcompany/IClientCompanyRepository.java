package com.concierge.apiconcierge.repositories.clientcompany;

import com.concierge.apiconcierge.models.clientcompany.ClientCompany;
import com.concierge.apiconcierge.models.clientcompany.FisJur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IClientCompanyRepository extends JpaRepository<ClientCompany, Integer> {

    @Query(value = "SELECT * FROM `tb_client_company` WHERE company_id=?1 AND resale_id=?2", nativeQuery = true)
    List<ClientCompany> listAll(Integer companyId, Integer resaleId);

    @Query(value = "SELECT * FROM `tb_client_company` WHERE company_id=?1 AND resale_id=?2 AND id=?3", nativeQuery = true)
    ClientCompany filterId(Integer companyId, Integer resaleId, Integer clientId);

    @Query(value = "SELECT * FROM `tb_client_company` WHERE company_id=?1 AND resale_id=?2 AND fisjur=?3 AND fantasia like %?4%", nativeQuery = true)
    List<ClientCompany> filterFantasia(Integer companyId, Integer resaleId, FisJur fisjur, String fantasia);

    @Query(value = "SELECT * FROM `tb_client_company` WHERE company_id=?1 AND resale_id=?2 AND fisjur=?3 AND name like %?4%", nativeQuery = true)
    List<ClientCompany> filterName(Integer companyId, Integer resaleId, FisJur fisjur, String name);

    @Query(value = "SELECT * FROM `tb_client_company` WHERE company_id=?1 AND resale_id=?2 AND cnpj=?3", nativeQuery = true)
    ClientCompany filterCNPJ(Integer companyId, Integer resaleId, String cnpj);

    @Query(value = "SELECT * FROM `tb_client_company` WHERE company_id=?1 AND resale_id=?2 AND cpf=?3", nativeQuery = true)
    ClientCompany filterCPF(Integer companyId, Integer resaleId, String cpf);


}
