package com.concierge.apiconcierge.models.module;


import com.concierge.apiconcierge.models.enums.YesNot;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
@SecondaryTable(name = "tb_company", pkJoinColumns = @PrimaryKeyJoinColumn(name = "id"))
@SecondaryTable(name = "tb_resale", pkJoinColumns = @PrimaryKeyJoinColumn(name = "id"))
@Table(name = "tb_conf_vehicle_entry_checklist")
@Entity(name = "tb_conf_vehicle_entry_checklist")
public class ConfVehicleEntryChecklist {

    @JoinColumn(table = "tb_company", referencedColumnName = "id")
    @Column(name = "company_id")
    private Integer companyId;

    @JoinColumn(table = "tb_resale", referencedColumnName = "id")
    @Column(name = "resale_id")
    private Integer resaleId;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private YesNot checklist1Enabled;
    private String checklist1Desc;

    private YesNot checklist2Enabled;
    private String checklist2Desc;

    private YesNot checklist3Enabled;
    private String checklist3Desc;

    private YesNot checklist4Enabled;
    private String checklist4Desc;

    private YesNot checklist5Enabled;
    private String checklist5Desc;

    private YesNot checklist6Enabled;
    private String checklist6Desc;

    private YesNot checklist7Enabled;
    private String checklist7Desc;

    private YesNot checklist8Enabled;
    private String checklist8Desc;

    private YesNot checklist9Enabled;
    private String checklist9Desc;

    private YesNot checklist10Enabled;
    private String checklist10Desc;

    private YesNot checklist11Enabled;
    private String checklist11Desc;

    private YesNot checklist12Enabled;
    private String checklist12Desc;

    private YesNot checklist13Enabled;
    private String checklist13Desc;

    private YesNot checklist14Enabled;
    private String checklist14Desc;

    private YesNot checklist15Enabled;
    private String checklist15Desc;

    private YesNot checklist16Enabled;
    private String checklist16Desc;

    private YesNot checklist17Enabled;
    private String checklist17Desc;

    private YesNot checklist18Enabled;
    private String checklist18Desc;

    private YesNot checklist19Enabled;
    private String checklist19Desc;

    private YesNot checklist20Enabled;
    private String checklist20Desc;
}
