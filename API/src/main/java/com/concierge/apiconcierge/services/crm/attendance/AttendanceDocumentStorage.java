package com.concierge.apiconcierge.services.crm.attendance;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import com.concierge.apiconcierge.exceptions.BusinessException;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Component
public class AttendanceDocumentStorage {
 private final Path root;
 public AttendanceDocumentStorage(@Value("${local.image.upload}") String imageDirectory, @Value("${local.document.upload:}") String documentDirectory) {
  Path images=Paths.get(imageDirectory).toAbsolutePath().normalize();
  this.root=(documentDirectory==null || documentDirectory.isBlank())?images.resolveSibling("attendance-documents"):Paths.get(documentDirectory).toAbsolutePath().normalize();
  if(root.startsWith(images)) throw new IllegalArgumentException("A pasta de documentos deve ficar fora da pasta publica de imagens.");
 }
 public String save(Integer companyId,Integer resaleId,Integer attendanceId,String extension,byte[] content) throws IOException {
  if(!java.util.Set.of("pdf","jpg","jpeg","png","webp").contains(extension)) throw new BusinessException("Extensao invalida.");
  String relative=companyId+"/"+resaleId+"/attendance/"+attendanceId+"/documents/"+UUID.randomUUID()+"."+extension;
  Path target=resolve(relative);
  Files.createDirectories(target.getParent());
  try { Files.write(target,content,StandardOpenOption.CREATE_NEW); }
  catch(FileAlreadyExistsException error) { throw error; }
  catch(IOException error) { Files.deleteIfExists(target); throw error; }
  return relative;
 }
 public byte[] read(String relative) throws IOException {return Files.readAllBytes(resolve(relative));}
 public void delete(String relative) throws IOException {Files.deleteIfExists(resolve(relative));}
 private Path resolve(String relative) throws IOException {
  if(relative==null || relative.isBlank()) throw new BusinessException("Caminho do documento nao informado.");
  Path path=Paths.get(relative);
  Path target=root.resolve(path).normalize();
  if(path.isAbsolute() || !target.startsWith(root) || target.equals(root)) throw new BusinessException("Caminho de documento invalido.");
  // Never follow a symbolic link into another storage directory.
  Path current=root;
  for(Path part:root.relativize(target)) {
   if(Files.isSymbolicLink(current)) throw new BusinessException("Caminho de documento invalido.");
   current=current.resolve(part);
  }
  if(Files.isSymbolicLink(current)) throw new BusinessException("Caminho de documento invalido.");
  return target;
 }
}
