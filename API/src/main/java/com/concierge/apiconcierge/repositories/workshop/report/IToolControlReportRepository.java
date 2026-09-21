package com.concierge.apiconcierge.repositories.workshop.report;

import com.concierge.apiconcierge.dtos.workshop.report.ToolControlReportDto;
import com.concierge.apiconcierge.models.workshop.mechanic.Mechanic;
import com.concierge.apiconcierge.models.workshop.toolcontrol.report.IToolControlReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Repository
public interface IToolControlReportRepository extends JpaRepository<Mechanic, Integer> {

    @Query(value = "SELECT mec.company_id AS 'CompanyId', mec.resale_id AS 'ResaleId',\n" +
            "req.id AS 'RequestId', req.status AS 'RequestStatus', req.request_type AS 'RequestType',req.request_user_id AS 'RequestUserId',\n" +
            "req.request_user_name AS 'RequestUserName',\n" +
            "req.request_date AS 'RequestDate',req.request_information AS 'RequestInformation', \n" +
            "cat.id AS 'CategoryId', cat.description AS 'CategoryDesc',\n" +
            "matmec.id AS 'MatMecId', \n" +
            "matmec.delivery_user_id AS \"MatMecDelivUserId\",matmec.delivery_user_name AS \"MatMecDelivUserName\",\n" +
            "matmec.delivery_quantity AS 'MatMecDelivQuantity',matmec.delivery_date AS 'MatMecDelivDate', matmec.delivery_information AS 'MatMecDelivInfor',\n" +
            "matmec.return_user_id AS 'MatMecReturUserId',matmec.return_user_name AS 'MatMecReturUserName',\n" +
            "matmec.return_quantity AS 'MatMecReturQuantity', matmec.return_date AS 'MatMecReturDate', matmec.return_information AS 'MatMecReturInfor', \n" +
            "matmec.material_id AS 'MatMecMaterialId', matmec.material_description AS \"MatMecMaterialDesc\" FROM tb_mechanic AS mec \n" +
            "INNER JOIN tb_tool_control_request AS req ON mec.company_id=?1 AND mec.resale_id=?2 AND mec.id=req.mechanic_id AND mec.id=?3 AND mec.status=0 \n" +
            "INNER JOIN tb_tool_control_mat_mec AS matmec ON req.id = matmec.request_id AND matmec.return_date IS NULL AND matmec.return_quantity=0 AND matmec.return_user_id IS NULL \n" +
            "INNER JOIN tb_tool_control_material AS mat ON matmec.material_id=mat.id \n" +
            "INNER JOIN tb_tool_control_category AS cat ON mat.category_id = cat.id;", nativeQuery = true)
    List<IToolControlReport> filterMechanic(Integer companyId, Integer resaleId, Integer mechanicId);


}
