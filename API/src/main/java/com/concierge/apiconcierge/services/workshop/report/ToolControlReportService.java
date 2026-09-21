package com.concierge.apiconcierge.services.workshop.report;

import com.concierge.apiconcierge.exceptions.workshop.toolcontrol.ToolControlException;
import com.concierge.apiconcierge.models.workshop.mechanic.Mechanic;
import com.concierge.apiconcierge.models.workshop.toolcontrol.ToolControlMatMec;
import com.concierge.apiconcierge.models.workshop.toolcontrol.ToolControlRequest;
import com.concierge.apiconcierge.models.workshop.toolcontrol.enums.StatusRequest;
import com.concierge.apiconcierge.models.workshop.toolcontrol.enums.TypeRequest;
import com.concierge.apiconcierge.models.workshop.toolcontrol.report.IToolControlReport;
import com.concierge.apiconcierge.repositories.workshop.mechanic.IMechanicRepository;
import com.concierge.apiconcierge.repositories.workshop.report.IToolControlReportRepository;
import com.concierge.apiconcierge.repositories.workshop.toolcontrol.IToolControlMatMecRepository;
import com.concierge.apiconcierge.repositories.workshop.toolcontrol.IToolControlRequestRepository;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.ByteBuffer;
import java.util.*;

@Service
public class ToolControlReportService implements IToolControlReportService {

    @Autowired
    private IToolControlReportRepository reportRepository;

    @Autowired
    private IToolControlRequestRepository requestRepository;

    @Autowired
    private IToolControlMatMecRepository matMecRepository;

    @Autowired
    private IMechanicRepository mechanicRepository;

    @SneakyThrows
    @Override
    public Map<String, Object> filterMechanic(Integer companyId, Integer resaleId, Integer mechanicId) {
        try {
            List<IToolControlReport> list = this.reportRepository.filterMechanic(companyId, resaleId, mechanicId);
            if (list.isEmpty())
                throw new ToolControlException("Not found.");

            Map<String, Object> map = new HashMap<>();
            map.put("companyId", list.get(0).getCompanyId());
            map.put("resaleId", list.get(0).getResaleId());
            map.put("mecId", mechanicId);
            List<Map<String, Object>> listItems = new ArrayList<>();
            for (var item : list) {
                Map<String, Object> map1 = new HashMap<>();
                map1.put("requestId", item.getRequestId());
                map1.put("requestDate", item.getRequestDate());
                map.put("requestStatus", item.getRequestStatus());
                map.put("requestTypeMaterial", item.getRequestType() == 0 ? TypeRequest.Loan : TypeRequest.Kit);
                map.put("requestUserId", item.getRequestUserId());
                map1.put("requestInformation", item.getRequestInformation());
                map1.put("categoryId", item.getCategoryId());
                map1.put("categoryDesc", item.getCategoryDesc());

                map1.put("matMecId", convertBytesToUUID(item.getMatMecId()));

                map1.put("matMecDelivUserId", item.getMatMecDelivUserId());
                map1.put("matMecDelivUserName", item.getMatMecDelivUserName());
                map1.put("matMecDelivQuantity", item.getMatMecDelivQuantity());
                map1.put("matMecDelivDate", item.getMatMecDelivDate());
                map1.put("matMecDelivInfor", item.getMatMecDelivInfor());

                map1.put("matMecReturUserId", item.getMatMecReturUserId() != null ? item.getMatMecReturUserId() : 0);
                map1.put("matMecReturUserName", item.getMatMecReturUserName() != null ? item.getMatMecReturUserName() : "");
                map1.put("matMecReturQuantity", item.getMatMecReturQuantity());
                map1.put("matMecReturDate", item.getMatMecReturDate() != null ? item.getMatMecReturDate() : "");
                map1.put("matMecReturInfor", item.getMatMecReturInfor());

                map1.put("matMecMaterialId", item.getMatMecMaterialId());
                map1.put("matMecMaterialDesc", item.getMatMecMaterialDesc());
                listItems.add(map1);
            }
            map.put("materials", listItems);
            return map;
        } catch (Exception ex) {
            throw new ToolControlException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public Map<String, Object> filterMechanicId(Integer companyId, Integer resaleId, Integer mechanicId) {
        try {
            List<ToolControlRequest> requests = this.requestRepository.filterByMechanicIdStatus(companyId, resaleId, mechanicId, StatusRequest.Delivered, StatusRequest.Delivery_Completed);
            Map<String, Object> responseMap = new HashMap<>();
            if(!requests.isEmpty()){
                List<ToolControlMatMec> materials = this.matMecRepository.filterByMechanic(companyId, resaleId, mechanicId);
                Mechanic mec = this.mechanicRepository.filterId(companyId, resaleId, mechanicId);
                responseMap.put("companyId",mec.getCompanyId());
                responseMap.put("resaleId",mec.getResaleId());
                responseMap.put("id",mec.getId());
                responseMap.put("name",mec.getName());
                responseMap.put("codePassword",mec.getCodePassword());
                responseMap.put("departmentId",mec.getDepartmentId());
                responseMap.put("photoUrl",mec.getPhotoUrl());

                List<Map<String, Object>> listMat = new ArrayList<>();
                for (ToolControlRequest req : requests) {
                    for (ToolControlMatMec mat : materials) {
                        if (req.getId().equals(mat.getRequestId())) {
                            Map<String, Object> mapMaterials = new HashMap<>();
                            mapMaterials.put("requestId", mat.getRequestId());
                            mapMaterials.put("deliveryDate", mat.getDeliveryDate());
                            mapMaterials.put("deliveryQuantity", mat.getDeliveryQuantity());
                            mapMaterials.put("deliveryInformation",mat.getDeliveryInformation());
                            mapMaterials.put("matmecId", mat.getId());
                            mapMaterials.put("materialId", mat.getMaterialId());
                            mapMaterials.put("materialDesc", mat.getMaterialDescription());
                            listMat.add(mapMaterials);
                        }
                    }
                }
                responseMap.put("materials",listMat);
            }
            return responseMap;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private static UUID convertBytesToUUID(byte[] bytes) {
        ByteBuffer byteBuffer = ByteBuffer.wrap(bytes);
        long high = byteBuffer.getLong();
        long low = byteBuffer.getLong();
        return new UUID(high, low);
    }


}
