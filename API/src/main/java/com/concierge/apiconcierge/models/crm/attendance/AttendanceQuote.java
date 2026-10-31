package com.concierge.apiconcierge.models.crm.attendance;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.util.*;

@Getter @Setter @Entity
@Table(name = "tb_crm_attendance_quote", uniqueConstraints = @UniqueConstraint(name = "uk_attendance_quote", columnNames = "attendance_id"))
public class AttendanceQuote {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Integer id;
    @Column(name = "attendance_id", nullable = false) private Integer attendanceId;
    @Column(name = "company_id", nullable = false) private Integer companyId;
    @Column(name = "resale_id", nullable = false) private Integer resaleId;
    @Column(name = "date_created", nullable = false) private Date dateCreated;
    @Column(name = "date_updated", nullable = false) private Date dateUpdated;
    @Column(length = 2000) private String notes = "";
    @Column(nullable = false, precision = 19, scale = 2) private BigDecimal subtotal;
    @Column(name = "discount_total", nullable = false, precision = 19, scale = 2) private BigDecimal discountTotal;
    @Column(nullable = false, precision = 19, scale = 2) private BigDecimal total;
    @Version private Long version;
    @OneToMany(mappedBy = "quote", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("position ASC")
    private List<AttendanceQuoteItem> items = new ArrayList<>();
}
