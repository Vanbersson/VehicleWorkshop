package com.concierge.apiconcierge.repositories.permission;

import com.concierge.apiconcierge.models.permission.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IPermissionRepository extends JpaRepository<Permission, Integer> {

}
