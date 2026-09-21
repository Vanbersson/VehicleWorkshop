package com.concierge.apiconcierge.repositories;

import com.concierge.apiconcierge.models.address.Address;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AddressRepository extends JpaRepository<Address, Integer> {

    Address findByZipCode(String zipcode);
}
