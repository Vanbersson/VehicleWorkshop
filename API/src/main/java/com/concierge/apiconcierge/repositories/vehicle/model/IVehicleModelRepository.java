package com.concierge.apiconcierge.repositories.vehicle.model;

import com.concierge.apiconcierge.models.vehicle.model.VehicleModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IVehicleModelRepository extends JpaRepository<VehicleModel, Integer> {

    @Query(value = "SELECT * FROM `tb_vehicle_model` WHERE company_id=?1 AND resale_id=?2", nativeQuery = true)
    List<VehicleModel> listAll(Integer companyId, Integer resaleId);

    @Query(value = "SELECT * FROM `tb_vehicle_model` WHERE company_id=?1 AND resale_id=?2 AND status=0", nativeQuery = true)
    List<VehicleModel> listAllEnabled(Integer companyId, Integer resaleId);

}
