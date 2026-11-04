package com.concierge.apiconcierge.models.crm.attendance;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.Date;

@Getter
@Setter
@Entity
@Table(name = "tb_crm_attendance_document")
public class AttendanceDocument {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(name = "attendance_id", nullable = false)
    private Integer attendanceId;
    @Column(name = "file_name", nullable = false)
    private String fileName;
    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;
    @Column(name = "file_size", nullable = false)
    private Long size;
    @Column(name = "created_at", nullable = false)
    private Date createdAt;
    @Column(name = "file_path", nullable = false, length = 1024)
    private String filePath;
}
