package com.concierge.apiconcierge.models.vehicle;

import com.concierge.apiconcierge.models.vehicle.enums.ColorVehicleEnum;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@SecondaryTable(name = "tb_company", pkJoinColumns = @PrimaryKeyJoinColumn(name = "id"))
@SecondaryTable(name = "tb_resale", pkJoinColumns = @PrimaryKeyJoinColumn(name = "id"))
@SecondaryTable(name = "tb_vehicle_model", pkJoinColumns = @PrimaryKeyJoinColumn(name = "id"))
@SecondaryTable(name = "tb_client_company", pkJoinColumns = @PrimaryKeyJoinColumn(name = "id"))
@Entity
@Table(name = "tb_vehicle")
public class Vehicle {

    @JoinColumn(table = "tb_company", referencedColumnName = "id")
    @Column(name = "company_id")
    private Integer companyId;

    @JoinColumn(table = "tb_resale", referencedColumnName = "id")
    @Column(name = "resale_id")
    private Integer resaleId;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String placa;

    private String chassi;

    private String frota;

    @Column(name = "year_manufacture")
    private String yearManufacture;

    @Column(name = "year_model")
    private String yearModel;

    @Column(name = "km_current")
    private String kmCurrent;

    @Column(name = "km_last")
    private String kmLast;

    private ColorVehicleEnum color;

    @JoinColumn(table = "tb_vehicle_model", referencedColumnName = "id")
    @Column(name = "model_id")
    private Integer modelId;

    @JoinColumn(table = "tb_client_company", referencedColumnName = "id")
    @Column(name = "owner_id")
    private Integer ownerId;


}
