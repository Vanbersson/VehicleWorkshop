package com.concierge.apiconcierge.repositories.vehicle.entry;

import com.concierge.apiconcierge.controllers.dashboard.interfaces.IDashCountVehiclePenAuthBud;
import com.concierge.apiconcierge.models.enums.YesNot;
import com.concierge.apiconcierge.models.vehicle.entry.VehicleEntry;
import com.concierge.apiconcierge.models.vehicle.enums.StatusAuthExitEnum;
import com.concierge.apiconcierge.models.vehicle.enums.StatusVehicleEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IVehicleEntryRepository extends JpaRepository<VehicleEntry, Integer> {
    @Query(value = "SELECT * FROM `tb_vehicle_entry` WHERE company_id=?1 AND resale_id=?2 AND id=?3",
            nativeQuery = true)
    VehicleEntry filterId(Integer companyId, Integer resaleId, Integer id);

    @Query(value = "SELECT * FROM `tb_vehicle_entry` WHERE company_id=?1 AND resale_id=?2 AND vehicle_plate=?3",
            nativeQuery = true)
    VehicleEntry filterPlate(Integer companyId, Integer resaleId, String plate);

    @Query(value = "SELECT * FROM `tb_vehicle_entry` WHERE company_id=?1 AND resale_id=?2 AND vehicle_plate_together=?3",
            nativeQuery = true)
    List<VehicleEntry> filterTogether(Integer companyId, Integer resaleId, String together);

    @Query(value = "select * from tb_vehicle_entry where company_id=?1 AND resale_id=?2 AND status=?3 AND auth_exit_status=?4",
            nativeQuery = true)
    List<VehicleEntry> allAuthorized(Integer companyId, Integer resaleId, StatusVehicleEnum status, StatusAuthExitEnum auth);

    @Query(value = "select * from tb_vehicle_entry where company_id=?1 AND resale_id=?2 AND status=?3",
            nativeQuery = true)
    List<VehicleEntry> all(Integer companyId, Integer resaleId, StatusVehicleEnum status);

    //Dashboard
    @Query(value = "SELECT COUNT(*) AS Vehicle, COALESCE(COUNT(CASE WHEN auth_exit_status = 2 THEN 1 END), 0) AS Authorized FROM tb_vehicle_entry WHERE company_id=?1 AND resale_id=?2 AND status=?3;", nativeQuery = true)
    IDashCountVehiclePenAuthBud countVehicles(Integer companyId, Integer resaleId, StatusVehicleEnum status);

//    @Query(value = "SELECT  \n" +
//            "(SELECT COALESCE(SUM((hour_service * price)-discount) ,0) AS sevicos FROM tb_budget_service WHERE budget_id=tbu.id) AS Service,\n" +
//            "(SELECT COALESCE(SUM((quantity * price)-discount) ,0)  AS item FROM tb_budget_item WHERE budget_id=tbu.id) AS Part\n" +
//            "FROM tb_vehicle_entry AS tbe\n" +
//            "INNER JOIN tb_budget AS tbu ON(tbe.company_id=tbu.company_id) AND tbe.resale_id = tbu.resale_id AND tbe.id=tbu.vehicle_entry_id\n" +
//            "WHERE tbe.company_id = ?1 \n" +
//            "AND tbe.resale_id = ?2 \n" +
//            "AND tbe.status = 0;", nativeQuery = true)
//    List<IDashValueTotalBudget> valueTotalBudget(Integer companyId, Integer resaleId);

    @Query(value = "SELECT COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 1  THEN 1 END), 0) AS january,\n" +
            "             COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 2  THEN 1 END), 0) AS february,\n" +
            "             COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 3  THEN 1 END), 0) AS march,\n" +
            "             COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 4  THEN 1 END), 0) AS april,\n" +
            "             COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 5  THEN 1 END), 0) AS may,\n" +
            "             COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 6  THEN 1 END), 0) AS june,\n" +
            "             COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 7  THEN 1 END), 0) AS july,\n" +
            "             COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 8  THEN 1 END), 0) AS august,\n" +
            "             COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 9  THEN 1 END), 0) AS september,\n" +
            "             COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 10 THEN 1 END), 0) AS october,\n" +
            "             COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 11 THEN 1 END), 0) AS november,\n" +
            "             COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 12 THEN 1 END), 0) AS december\n" +
            "            FROM tb_vehicle_entry\n" +
            "            WHERE company_id=?1\n" +
            "            AND resale_id=?2\n" +
            "            AND status=1\n" +
            "            AND vehicle_service_order= ?3\n" +
            "            AND YEAR(exit_date)=?4;", nativeQuery = true)
    Object countServiceMonth(Integer companyId, Integer resaleId, YesNot serviceOrder, Integer year);

    @Query(value = "SELECT\n" +
            " COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 1  THEN 1 END), 0) AS january,\n" +
            " COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 2  THEN 1 END), 0) AS february,\n" +
            " COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 3  THEN 1 END), 0) AS march,\n" +
            " COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 4  THEN 1 END), 0) AS april,\n" +
            " COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 5  THEN 1 END), 0) AS may,\n" +
            " COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 6  THEN 1 END), 0) AS june,\n" +
            " COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 7  THEN 1 END), 0) AS july,\n" +
            " COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 8  THEN 1 END), 0) AS august,\n" +
            " COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 9  THEN 1 END), 0) AS september,\n" +
            " COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 10 THEN 1 END), 0) AS october,\n" +
            " COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 11 THEN 1 END), 0) AS november,\n" +
            " COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 12 THEN 1 END), 0) AS december\n" +
            "FROM tb_vehicle_entry\n" +
            "WHERE company_id=?1\n" +
            "AND resale_id=?2\n" +
            "AND status = 1\n" +
            "AND vehicle_service_order = ?3\n" +
            "AND YEAR(exit_date) = ?4\n" +
            "AND client_company_id = ?5;", nativeQuery = true)
    Object countServiceMonthClient(Integer companyId, Integer resaleId, YesNot serviceOrder, Integer year, Integer client);

    @Query(value = "SELECT\n" +
            " COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 1  THEN 1 END), 0) AS january,\n" +
            " COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 2  THEN 1 END), 0) AS february,\n" +
            " COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 3  THEN 1 END), 0) AS march,\n" +
            " COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 4  THEN 1 END), 0) AS april,\n" +
            " COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 5  THEN 1 END), 0) AS may,\n" +
            " COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 6  THEN 1 END), 0) AS june,\n" +
            " COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 7  THEN 1 END), 0) AS july,\n" +
            " COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 8  THEN 1 END), 0) AS august,\n" +
            " COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 9  THEN 1 END), 0) AS september,\n" +
            " COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 10 THEN 1 END), 0) AS october,\n" +
            " COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 11 THEN 1 END), 0) AS november,\n" +
            " COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 12 THEN 1 END), 0) AS december\n" +
            "FROM tb_vehicle_entry\n" +
            "WHERE company_id=?1\n" +
            "AND resale_id=?2\n" +
            "AND YEAR(exit_date) = ?3;", nativeQuery = true)
    Object countVehicleMonth(Integer companyId, Integer resaleId, Integer year);

    @Query(value = "SELECT\n" +
            " COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 1  THEN 1 END), 0) AS january,\n" +
            " COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 2  THEN 1 END), 0) AS february,\n" +
            " COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 3  THEN 1 END), 0) AS march,\n" +
            " COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 4  THEN 1 END), 0) AS april,\n" +
            " COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 5  THEN 1 END), 0) AS may,\n" +
            " COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 6  THEN 1 END), 0) AS june,\n" +
            " COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 7  THEN 1 END), 0) AS july,\n" +
            " COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 8  THEN 1 END), 0) AS august,\n" +
            " COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 9  THEN 1 END), 0) AS september,\n" +
            " COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 10 THEN 1 END), 0) AS october,\n" +
            " COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 11 THEN 1 END), 0) AS november,\n" +
            " COALESCE(COUNT(CASE WHEN MONTH(exit_date) = 12 THEN 1 END), 0) AS december\n" +
            "FROM tb_vehicle_entry\n" +
            "WHERE company_id=?1\n" +
            "AND resale_id=?2\n" +
            "AND YEAR(exit_date)=?3\n" +
            "AND client_company_id=?4;", nativeQuery = true)
    Object countVehicleClientMonth(Integer companyId, Integer resaleId, Integer year, Integer client);

}
