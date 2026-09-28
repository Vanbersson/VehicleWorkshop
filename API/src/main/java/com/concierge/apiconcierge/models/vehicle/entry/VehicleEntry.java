package com.concierge.apiconcierge.models.vehicle.entry;

import com.concierge.apiconcierge.models.enums.YesNot;
import com.concierge.apiconcierge.models.vehicle.enums.*;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.util.Date;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@Entity
@Table(name = "tb_vehicle_entry")
public class VehicleEntry {

    @Column(name = "company_id")
    private Integer companyId;

    @Column(name = "resale_id")
    private Integer resaleId;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private StatusVehicleEnum status;
    @Column(name = "step_entry")
    private StepVehicleEnum stepEntry;

    @Column(name = "budget_id")
    private Integer budgetId;

    @Column(name = "entry_user_id")
    private Integer entryUserId;
    @Column(name = "entry_user_name")
    private String entryUserName;
    @Column(name = "entry_date")
    private Date entryDate;
    @Column(name = "entry_photo1_url")
    private String entryPhoto1Url;
    @Column(name = "entry_photo2_url")
    private String entryPhoto2Url;
    @Column(name = "entry_photo3_url")
    private String entryPhoto3Url;
    @Column(name = "entry_photo4_url")
    private String entryPhoto4Url;
    @Column(name = "entry_information")
    private String entryInformation;

    @Column(name = "exit_date_prevision")
    private Date exitDatePrevision;

    @Column(name = "exit_user_id")
    private Integer exitUserId;
    @Column(name = "exit_user_name")
    private String exitUserName;
    @Column(name = "exit_date")
    private Date exitDate;
    @Column(name = "exit_photo1_url")
    private String exitPhoto1Url;
    @Column(name = "exit_photo2_url")
    private String exitPhoto2Url;
    @Column(name = "exit_photo3_url")
    private String exitPhoto3Url;
    @Column(name = "exit_photo4_url")
    private String exitPhoto4Url;
    @Column(name = "exit_information")
    private String exitInformation;

    @Column(name = "attendant_user_id")
    private Integer attendantUserId;
    @Column(name = "attendant_user_name")
    private String attendantUserName;
    @Column(name = "attendant_photo1_url")
    private String attendantPhoto1Url;
    @Column(name = "attendant_photo2_url")
    private String attendantPhoto2Url;
    @Column(name = "attendant_photo3_url")
    private String attendantPhoto3Url;
    @Column(name = "attendant_photo4_url")
    private String attendantPhoto4Url;
    @Column(name = "attendant_information")
    private String attendantInformation;

    @Column(name = "auth_exit_status")
    private StatusAuthExitEnum authExitStatus;

    @Column(name = "auth1_exit_user_id")
    private Integer auth1ExitUserId;
    @Column(name = "auth1_exit_user_name")
    private String auth1ExitUserName;
    @Column(name = "auth1_exit_date")
    private Date auth1ExitDate;

    @Column(name = "auth2_exit_user_id")
    private Integer auth2ExitUserId;
    @Column(name = "auth2_exit_user_name")
    private String auth2ExitUserName;
    @Column(name = "auth2_exit_date")
    private Date auth2ExitDate;

    @Column(name = "model_id")
    private Integer modelId;
    @Column(name = "model_description")
    private String modelDescription;

    @Column(name = "client_company_id")
    private Integer clientCompanyId;
    @Column(name = "client_company_name")
    private String clientCompanyName;

    @Column(name = "driver_entry_id")
    private Integer driverEntryId;
    @Column(name = "driver_entry_name")
    private String driverEntryName;

    @Column(name = "driver_exit_id")
    private Integer driverExitId;
    @Column(name = "driver_exit_name")
    private String driverExitName;

    @Column(name = "vehicle_plate")
    private String vehiclePlate;
    @Column(name = "vehicle_plate_together")
    private String vehiclePlateTogether;
    @Column(name = "vehicle_fleet")
    private String vehicleFleet;
    @Column(name = "vehicle_color")
    private ColorVehicleEnum vehicleColor;
    @Column(name = "vehicle_km_entry")
    private String vehicleKmEntry;
    @Column(name = "vehicle_km_exit")
    private String vehicleKmExit;
    @Column(name = "vehicle_new")
    private YesNot vehicleNew;
    @Column(name = "vehicle_service_order")
    private YesNot vehicleServiceOrder;

    @Column(name = "num_service_order")
    private String numServiceOrder;
    @Column(name = "num_nfe")
    private String numNfe;
    @Column(name = "num_nfse")
    private String numNfse;

    @Column(name = "checklist_id")
    private Integer checklistId;

}
