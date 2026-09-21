package com.concierge.apiconcierge.controllers;

import com.concierge.apiconcierge.dtos.AddressDto;
import com.concierge.apiconcierge.models.address.Address;
import com.concierge.apiconcierge.repositories.AddressRepository;
import jakarta.validation.Valid;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/address")
public class AddressController {

    @Autowired
    AddressRepository addressRepository;

    @PostMapping("/add")
    public ResponseEntity<Object> addAddress(@RequestBody @Valid AddressDto data) {
        Address address0 = addressRepository.findByZipCode(data.zipCode());

        if (address0 != null) return ResponseEntity.status(HttpStatus.CONFLICT).body("Address already exists.");

        Address address = new Address();
        BeanUtils.copyProperties(data, address);

        return ResponseEntity.status(HttpStatus.CREATED).body(addressRepository.save(address));
    }

    @PostMapping("/update")
    public ResponseEntity<Address> updateAddress(@RequestBody @Valid AddressDto data) {
        Optional<Address> address0 = addressRepository.findById(data.id());

        if (address0.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        Address address = new Address();
        BeanUtils.copyProperties(data, address);

        return ResponseEntity.status(HttpStatus.OK).body(addressRepository.save(address));

    }

    @GetMapping("/all")
    public ResponseEntity<List<Address>> allAddress() {

        List<Address> addresses = addressRepository.findAll();

        return ResponseEntity.ok(addresses);

    }

    @GetMapping("/zipcode/{zipcode}")
    public ResponseEntity<Address> cepAddress(@PathVariable(value = "zipcode") String zipCode) {

        Address address = addressRepository.findByZipCode(zipCode);

        if (address == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        return ResponseEntity.ok(address);

    }

    @GetMapping("/id/{id}")
    public ResponseEntity<Object> cepAddress(@PathVariable(value = "id") Integer id) {

        Optional<Address> address = addressRepository.findById(id);

        if (address.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        return ResponseEntity.ok(address);

    }


}
