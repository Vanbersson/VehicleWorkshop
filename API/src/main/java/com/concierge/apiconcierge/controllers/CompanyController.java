package com.concierge.apiconcierge.controllers;

import com.concierge.apiconcierge.dtos.CompanyDto;
import com.concierge.apiconcierge.models.companies.Company;
import com.concierge.apiconcierge.repositories.CompanyRepository;
import jakarta.validation.Valid;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/company")
public class CompanyController {

    @Autowired
    private CompanyRepository companyRepository;

    @PostMapping("/save")
    public ResponseEntity<Object> saveCompany(@RequestBody @Valid CompanyDto data) {
        Company company0 = companyRepository.findByCnpj(data.cnpj());

        if (company0 != null) return ResponseEntity.status(HttpStatus.CONFLICT).body("Company already exists.");

        Company company = new Company();
        BeanUtils.copyProperties(data, company);
        this.companyRepository.save(company);

        return ResponseEntity.status(HttpStatus.CREATED).build();

    }

    @PostMapping("/update")
    public ResponseEntity<Object> updateCompany(@RequestBody @Valid CompanyDto data) {
        Optional<Company> company0 = companyRepository.findById(data.id());

        if (company0.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        Company company = new Company();
        BeanUtils.copyProperties(data, company);

        this.companyRepository.save(company);

        return ResponseEntity.status(HttpStatus.OK).build();

    }

    @GetMapping("/all")
    public ResponseEntity<List<Company>> allCompany() {
        List<Company> companies = this.companyRepository.findAll();
        return ResponseEntity.ok(companies);
    }

    @GetMapping("/filter/cnpj/{cnpj}")
    public ResponseEntity<Object> cnpjCompany(@PathVariable(value = "cnpj") String cnpj) {
        Company company0 = companyRepository.findByCnpj(cnpj);
        if (company0 == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        return ResponseEntity.ok(company0);
    }

    @GetMapping("/filter/id/{id}")
    public ResponseEntity<Object> idCompany(@PathVariable(value = "id") Integer id) {
        Optional<Company> company0 = companyRepository.findById(id);
        if (company0.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        return ResponseEntity.ok(company0);
    }


}
