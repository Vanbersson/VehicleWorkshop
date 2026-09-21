package com.concierge.apiconcierge.controllers.purchase;

import com.concierge.apiconcierge.dtos.message.MessageResponseDto;
import com.concierge.apiconcierge.dtos.purchase.PurchaseOrderItemConsDto;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.purchase.PurchaseOrderItemConsumption;
import com.concierge.apiconcierge.models.purchase.item.PurchaseOrderItem;
import com.concierge.apiconcierge.services.purchase.consumption.IPurchaseOrderItemConsService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/purchase/order/item/cons")
public class PurchaseOrderItemConsController {

    @Autowired
    private IPurchaseOrderItemConsService service;

    @PostMapping("/save")
    public ResponseEntity<Object> save(@RequestBody PurchaseOrderItemConsDto data) {
        try {
            PurchaseOrderItemConsumption item = new PurchaseOrderItemConsumption();
            BeanUtils.copyProperties(data, item);
            MessageResponse response = this.service.save(item);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @PostMapping("/update")
    public ResponseEntity<Object> update(@RequestBody PurchaseOrderItemConsDto data) {
        try {
            PurchaseOrderItemConsumption item = new PurchaseOrderItemConsumption();
            BeanUtils.copyProperties(data, item);
            MessageResponse response = this.service.update(item);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }
    @PostMapping("/delete")
    public ResponseEntity<Object> delete(@RequestBody PurchaseOrderItemConsDto data) {
        try {
            PurchaseOrderItemConsumption item = new PurchaseOrderItemConsumption();
            BeanUtils.copyProperties(data, item);
            MessageResponse response = this.service.delete(item);
            return ResponseEntity.status(HttpStatus.OK).body(response);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }

    @GetMapping("/{companyId}/{resaleId}/filter/purchase/{id}")
    public ResponseEntity<Object> filter(@PathVariable(name = "companyId") Integer companyId,
                                         @PathVariable(name = "resaleId") Integer resaleId,
                                         @PathVariable(name = "id") Integer purchaseId) {
        try {
            List<PurchaseOrderItemConsumption> list = this.service.filter(companyId, resaleId, purchaseId);
            return ResponseEntity.status(HttpStatus.OK).body(list);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new MessageResponseDto(ex.getMessage()));
        }
    }
}
