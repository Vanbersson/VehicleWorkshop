package com.concierge.apiconcierge.controllers.crm;
import com.concierge.apiconcierge.dtos.crm.attendance.AttendanceDocumentDto;
import com.concierge.apiconcierge.services.crm.attendance.AttendanceDocumentService;
import com.concierge.apiconcierge.services.auth.TokenService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
@RestController @RequestMapping("/crm/customer-attendance/{attendanceId}/documents")
public class AttendanceDocumentController {
 private final AttendanceDocumentService service; private final TokenService tokens;
 public AttendanceDocumentController(AttendanceDocumentService service,TokenService tokens){this.service=service;this.tokens=tokens;}
 @GetMapping public List<AttendanceDocumentDto> list(@PathVariable Integer attendanceId,HttpServletRequest request){return service.list(attendanceId,email(request));}
 @PostMapping(consumes=MediaType.MULTIPART_FORM_DATA_VALUE) @ResponseStatus(HttpStatus.CREATED)
 public AttendanceDocumentDto upload(@PathVariable Integer attendanceId,@RequestParam("file") MultipartFile file,HttpServletRequest request) throws IOException {return service.upload(attendanceId,file,email(request));}
 @GetMapping("/{documentId}")
 public ResponseEntity<byte[]> download(@PathVariable Integer attendanceId,@PathVariable Integer documentId,HttpServletRequest request) throws IOException {
  var download=service.download(attendanceId,documentId,email(request));
  var document=download.document();
  return ResponseEntity.ok().contentType(MediaType.parseMediaType(document.getContentType())).contentLength(document.getSize())
   .header(HttpHeaders.CONTENT_DISPOSITION,ContentDisposition.attachment().filename(document.getFileName(),StandardCharsets.UTF_8).build().toString())
   .header(HttpHeaders.CACHE_CONTROL,"no-store").header("X-Content-Type-Options","nosniff").body(download.content());
 }
 private String email(HttpServletRequest request){return tokens.validToken(request.getHeader("Authorization").replace("Bearer ",""));}
}
