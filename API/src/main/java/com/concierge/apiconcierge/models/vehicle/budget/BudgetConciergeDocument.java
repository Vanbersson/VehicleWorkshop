package com.concierge.apiconcierge.models.vehicle.budget;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
@Getter @Setter @Entity @Table(name="tb_concierge_budget_document",uniqueConstraints=@UniqueConstraint(name="uk_concierge_budget_document",columnNames="budget_id"))
public class BudgetConciergeDocument {
    @JsonIgnore @Column(name="share_token_hash",length=64,unique=true) private String shareTokenHash;
    @JsonIgnore @Column(name="share_expires_at") private java.time.Instant shareExpiresAt;
    @Column(name="approved_at") private java.time.Instant approvedAt;
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Integer id;
    @Column(name="company_id",nullable=false) private Integer companyId;
    @Column(name="resale_id",nullable=false) private Integer resaleId;
    @Column(name="budget_id",nullable=false) private Integer budgetId;
    @Column(name="file_name",nullable=false,length=255) private String fileName;
    @Column(name="content_type",nullable=false,length=100) private String contentType;
    @Column(name="file_size",nullable=false) private Long size;
    @JsonIgnore @Column(name="file_path",nullable=false,length=1024) private String filePath;
    @Column(name="created_at",nullable=false) private LocalDateTime createdAt;
}
