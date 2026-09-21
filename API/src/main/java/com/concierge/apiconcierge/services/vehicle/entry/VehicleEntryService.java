package com.concierge.apiconcierge.services.vehicle.entry;

import com.concierge.apiconcierge.dtos.vehicle.entry.AuthExitDto;
import com.concierge.apiconcierge.dtos.vehicle.entry.VehicleExitDto;
import com.concierge.apiconcierge.exceptions.vehicle.VehicleEntryException;
import com.concierge.apiconcierge.models.enums.YesNot;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.models.notification.Notification;
import com.concierge.apiconcierge.models.notification.NotificationMenu;
import com.concierge.apiconcierge.models.notification.NotificationUser;
import com.concierge.apiconcierge.models.permission.PermissionUser;
import com.concierge.apiconcierge.models.user.User;
import com.concierge.apiconcierge.models.user.UserRoleEnum;
import com.concierge.apiconcierge.models.vehicle.checklist.VehicleEntryChecklist;
import com.concierge.apiconcierge.models.vehicle.entry.VehicleEntry;
import com.concierge.apiconcierge.models.vehicle.enums.StatusAuthExitEnum;
import com.concierge.apiconcierge.models.vehicle.enums.StatusVehicleEnum;
import com.concierge.apiconcierge.models.vehicle.enums.StepVehicleEnum;
import com.concierge.apiconcierge.repositories.budget.IBudgetRepository;
import com.concierge.apiconcierge.repositories.permission.IPermissionUserRepository;
import com.concierge.apiconcierge.repositories.user.IUserRepository;
import com.concierge.apiconcierge.repositories.vehicle.checklist.IVehicleEntryChecklistRepository;
import com.concierge.apiconcierge.repositories.vehicle.entry.IVehicleEntryRepository;
import com.concierge.apiconcierge.services.notification.notification.INotificationService;
import com.concierge.apiconcierge.services.notification.user.INotificationUserService;
import com.concierge.apiconcierge.util.ConstantsMessage;
import com.concierge.apiconcierge.validation.vehicle.entry.IVehicleEntryValidation;
import lombok.SneakyThrows;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

import static com.concierge.apiconcierge.util.ConstantsPermission.*;

@Service
public class VehicleEntryService implements IVehicleEntryService {

    @Value("${local.image.upload}")
    private String UPLOAD_DIR;

    @Autowired
    private IVehicleEntryRepository repository;

    @Autowired
    private IVehicleEntryValidation validation;

    @Autowired
    private IVehicleEntryChecklistRepository checklistRepository;

    @Autowired
    private IBudgetRepository repositoryBudget;

    @Autowired
    private INotificationService notificationService;

    @Autowired
    private INotificationUserService notificationUserService;

    @Autowired
    private IUserRepository userRepository;

    @Autowired
    private IPermissionUserRepository permissionUser;

    @SneakyThrows
    @Override
    public MessageResponse save(VehicleEntry vehicle, String userEmail) {
        try {
            MessageResponse response = this.validation.save(vehicle, userEmail);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                vehicle.setId(null);
                vehicle.setStatus(StatusVehicleEnum.Entered);
                vehicle.setStepEntry(StepVehicleEnum.Attendant);
                vehicle.setBudgetId(null);
                vehicle.setExitUserId(null);
                vehicle.setDriverExitId(null);
                vehicle.setAuth1ExitUserId(null);
                vehicle.setAuth2ExitUserId(null);
                vehicle.setAuthExitStatus(StatusAuthExitEnum.NotAuth);
                VehicleEntry resultVehicle = this.repository.save(vehicle);

                Map<String, Object> map = new HashMap<>();
                map.put("id", resultVehicle.getId());
                response.setData(map);
                //Notification
                User resultUser = this.userRepository.loginEmail(userEmail);
                this.sendNotification("Entry", resultVehicle, CONCIERGE_VEHICLE_ENTRY_NOTIFICATIONS, resultUser);
            }
            return response;
        } catch (Exception ex) {
            throw new VehicleEntryException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse update(VehicleEntry vehicle, String userEmail) {
        try {
            MessageResponse response = this.validation.update(vehicle, userEmail);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                VehicleEntry result = this.repository.save(vehicle);
                response.setData(result);

//                if (vehicleEntry.getClientCompanyId() != null) {
//                    if (vehicle.getBudgetStatus() != StatusBudgetEnum.NotBudget) {
//                        this.updateBudget(vehicleEntry);
//                    }
//                }
//                if (vehicleEntry.getDriverExitId() == 0) {
//                    vehicleEntry.setDriverExitId(null);
//                }
            }
            return response;
        } catch (Exception ex) {
            throw new VehicleEntryException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse exit(VehicleExitDto dataExit, String userEmail) {
        try {
            MessageResponse response = this.validation.exit(dataExit, userEmail);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                VehicleEntry vehicleEntry = this.repository.filterId(dataExit.companyId(), dataExit.resaleId(), dataExit.vehicleId());
                if (vehicleEntry.getAuthExitStatus() != StatusAuthExitEnum.Authorized && vehicleEntry.getStatus() == StatusVehicleEnum.Entered) {
                    response.setStatus(ConstantsMessage.ERROR);
                    response.setHeader(ConstantsMessage.ERROR);
                    response.setMessage("Veículo não autorizado.");
                    response.setData(null);
                }
                vehicleEntry.setStatus(StatusVehicleEnum.Exited);
                vehicleEntry.setStepEntry(StepVehicleEnum.Exit);
                vehicleEntry.setExitUserId(dataExit.exitUserId());
                vehicleEntry.setExitUserName(dataExit.exitUserName());
                vehicleEntry.setExitDate(dataExit.exitDate());
                vehicleEntry.setExitInformation(dataExit.exitInformation());
                vehicleEntry.setExitPhoto1Url(dataExit.exitPhoto1Url());
                vehicleEntry.setExitPhoto2Url(dataExit.exitPhoto2Url());
                vehicleEntry.setExitPhoto3Url(dataExit.exitPhoto3Url());
                vehicleEntry.setExitPhoto4Url(dataExit.exitPhoto4Url());
                VehicleEntry result = this.repository.save(vehicleEntry);
                //Notification
                User userOrigem = this.userRepository.loginEmail(userEmail);
                this.sendNotification("Exit", result, CONCIERGE_VEHICLE_EXIT_NOTIFICATIONS, userOrigem);
            }
            return response;
        } catch (Exception ex) {
            throw new VehicleEntryException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public List<Map<String, Object>> listAllAuthorized(Integer companyId, Integer resaleId) {
        try {
            String response = this.validation.listAllAuthorized(companyId, resaleId);
            if (ConstantsMessage.SUCCESS.equals(response)) {
                List<VehicleEntry> vehicles = this.repository.allAuthorized(companyId, resaleId, StatusVehicleEnum.Entered, StatusAuthExitEnum.Authorized);
                List<Map<String, Object>> list = new ArrayList<>();
                for (VehicleEntry item : vehicles) {
                    String plate = "";
                    if (!item.getVehiclePlate().isBlank())
                        plate = item.getVehiclePlate().substring(0, 3) + "-" + item.getVehiclePlate().substring(3, 7);
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", item.getId());
                    map.put("vehiclePlate", plate);
                    map.put("vehicleFleet", item.getVehicleFleet());
                    map.put("vehicleNew", item.getVehicleNew());
                    map.put("modelDescription", item.getModelDescription());
                    map.put("entryDate", item.getEntryDate());
                    map.put("attendantUserName", item.getAttendantUserName());
                    map.put("clientCompanyName", item.getClientCompanyName());
                    map.put("authExitStatus", item.getAuthExitStatus());
                    map.put("numServiceOrder", item.getNumServiceOrder());
                    map.put("auth1ExitUserName", item.getAuth1ExitUserName());
                    map.put("auth2ExitUserName", item.getAuth2ExitUserName());
                    list.add(map);
                }
                return list;
            } else {
                throw new VehicleEntryException(response);
            }
        } catch (Exception ex) {
            throw new VehicleEntryException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public List<Map<String, Object>> listAll(Integer companyId, Integer resaleId) {
        try {
            String response = this.validation.listAll(companyId, resaleId);
            if (ConstantsMessage.SUCCESS.equals(response)) {
                List<VehicleEntry> vehicles = this.repository.all(companyId, resaleId, StatusVehicleEnum.Entered);
                List<Map<String, Object>> list = new ArrayList<>();
                for (VehicleEntry item : vehicles) {
                    String plate = "";
                    if (!item.getVehiclePlate().isBlank())
                        plate = item.getVehiclePlate().substring(0, 3) + "-" + item.getVehiclePlate().substring(3, 7);
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", item.getId());
                    map.put("vehiclePlate", plate);
                    map.put("vehicleFleet", item.getVehicleFleet());
                    map.put("vehicleNew", item.getVehicleNew());
                    map.put("modelDescription", item.getModelDescription());
                    map.put("entryDate", item.getEntryDate());
                    map.put("attendantUserName", item.getAttendantUserName());
                    map.put("clientCompanyName", item.getClientCompanyName());
                    map.put("authExitStatus", item.getAuthExitStatus());
                    map.put("numServiceOrder", item.getNumServiceOrder());
                    list.add(map);
                }
                return list;
            } else {
                throw new VehicleEntryException(response);
            }
        } catch (Exception ex) {
            throw new VehicleEntryException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse filterId(Integer companyId, Integer resaleId, Integer id) {
        try {
            MessageResponse response = this.validation.filterId(companyId, resaleId, id);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                VehicleEntry vehicle = repository.filterId(companyId, resaleId, id);
                if (vehicle == null) {
                    throw new VehicleEntryException("Veículo não encontrado.");
                }
                response.setData(vehicle);
            }
            return response;
        } catch (Exception ex) {
            throw new VehicleEntryException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse saveChecklist(VehicleEntryChecklist ch, String userEmail) {
        try {
            MessageResponse response = new MessageResponse();
            //Verifica se o usuário tem permissão
            User user = this.userRepository.loginEmail(userEmail);
            if (user.getRoleFunc() != UserRoleEnum.ADMIN) {
                PermissionUser permission = this.permissionUser.findPermissionId(user.getCompanyId(), user.getResaleId(), user.getId(), AUTH_ENTRY_VEHICLE);
                if (permission == null) {
                    response.setStatus(ConstantsMessage.ERROR);
                    response.setHeader("Permissão - " + AUTH_ENTRY_VEHICLE);
                    response.setMessage(ConstantsMessage.NOT_PERMISSION);
                    return response;
                }
            }
            ch.setId(null);
            VehicleEntryChecklist checklist = this.checklistRepository.save(ch);

            response.setStatus(ConstantsMessage.SUCCESS);
            response.setHeader("Checklist");
            response.setMessage("Salvo com sucesso.");
            response.setData(checklist);
            return response;
        } catch (Exception ex) {
            throw new VehicleEntryException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse updateChecklist(VehicleEntryChecklist ch) {
        try {
            VehicleEntryChecklist checklist = this.checklistRepository.save(ch);
            MessageResponse response = new MessageResponse();
            response.setStatus(ConstantsMessage.SUCCESS);
            response.setHeader("Checklist");
            response.setMessage("Atualizado com sucesso.");
            response.setData(checklist);
            return response;
        } catch (Exception ex) {
            throw new VehicleEntryException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse filterChecklist(Integer companyId, Integer resaleId, Integer id) {
        try {
            MessageResponse response = this.validation.filterId(companyId, resaleId, id);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                VehicleEntryChecklist checklist = this.checklistRepository.filterId(companyId, resaleId, id);
                if (checklist == null) {
                    throw new VehicleEntryException("Checklist não encontrado.");
                }
                response.setData(checklist);
            }
            return response;
        } catch (Exception ex) {
            throw new VehicleEntryException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse filterPlate(Integer companyId, Integer resaleId, String plate) {
        try {
            MessageResponse response = this.validation.filterPlate(companyId, resaleId, plate);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                VehicleEntry vehicle = repository.filterPlate(companyId, resaleId, plate);
                if (vehicle == null) {
                    throw new VehicleEntryException("Veículo não encontrado.");
                }
                response.setData(vehicle);
            }
            return response;
        } catch (Exception ex) {
            throw new VehicleEntryException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse filterTogether(Integer companyId, Integer resaleId, String together) {
        try {
            MessageResponse response = this.validation.filterPlate(companyId, resaleId, together);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                List<VehicleEntry> vehicles = repository.filterTogether(companyId, resaleId, together);
                if (vehicles.isEmpty()) {
                    throw new VehicleEntryException("Veículos não encontrado.");
                }
                List<Map<String, Object>> list = new ArrayList<>();
                for (VehicleEntry item : vehicles) {
                    String plate = "";
                    if (!item.getVehiclePlate().isBlank())
                        plate = item.getVehiclePlate().substring(0, 3) + "-" + item.getVehiclePlate().substring(3, 7);
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", item.getId());
                    map.put("status", item.getStatus());
                    map.put("vehiclePlate", plate);
                    map.put("vehicleFleet", item.getVehicleFleet());
                    map.put("vehicleNew", item.getVehicleNew());
                    map.put("modelDescription", item.getModelDescription());
                    map.put("entryDate", item.getEntryDate());
                    map.put("exitDate", item.getExitDate());
                    map.put("attendantUserName", item.getAttendantUserName());
                    map.put("clientCompanyName", item.getClientCompanyName());
                    map.put("numServiceOrder", item.getNumServiceOrder());
                    list.add(map);
                }
                response.setData(list);
            }
            return response;
        } catch (Exception ex) {
            throw new VehicleEntryException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse addAuthExit(AuthExitDto authExitDto, String userEmail) {
        try {
            VehicleEntry vehicle = this.repository.filterId(authExitDto.companyId(), authExitDto.resaleId(), authExitDto.vehicleId());
            if (vehicle == null) {
                throw new VehicleEntryException("Veículo não encontrado.");
            }
            MessageResponse response = this.validation.addAuthExit(vehicle, authExitDto, userEmail);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                if (vehicle.getAuth1ExitUserId() == null) {
                    vehicle.setAuth1ExitUserId(authExitDto.userId());
                    vehicle.setAuth1ExitUserName(authExitDto.userName());
                    vehicle.setAuth1ExitDate(authExitDto.dateAuth());
                    vehicle.setAuthExitStatus(statusAuthorization(vehicle));
                    this.repository.save(vehicle);
                } else if (vehicle.getAuth2ExitUserId() == null) {
                    vehicle.setAuth2ExitUserId(authExitDto.userId());
                    vehicle.setAuth2ExitUserName(authExitDto.userName());
                    vehicle.setAuth2ExitDate(authExitDto.dateAuth());
                    vehicle.setAuthExitStatus(statusAuthorization(vehicle));
                    this.repository.save(vehicle);
                }
            }
            return response;
        } catch (Exception ex) {
            throw new VehicleEntryException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse deleteAuthExit1(AuthExitDto authExitDto, String userEmail) {
        try {
            VehicleEntry vehicle = this.repository.filterId(authExitDto.companyId(), authExitDto.resaleId(), authExitDto.vehicleId());
            MessageResponse response = this.validation.deleteAuthExit1(vehicle, authExitDto, userEmail);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                vehicle.setAuth1ExitUserId(null);
                vehicle.setAuth1ExitUserName("");
                vehicle.setAuth1ExitDate(null);
                vehicle.setAuthExitStatus(this.deleteAuthExit(vehicle.getAuthExitStatus()));
                this.repository.save(vehicle);
            }
            return response;
        } catch (Exception ex) {
            throw new VehicleEntryException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse deleteAuthExit2(AuthExitDto authExitDto, String userEmail) {
        try {
            VehicleEntry vehicle = this.repository.filterId(authExitDto.companyId(), authExitDto.resaleId(), authExitDto.vehicleId());
            MessageResponse response = this.validation.deleteAuthExit2(vehicle, authExitDto, userEmail);
            if (ConstantsMessage.SUCCESS.equals(response.getStatus())) {
                vehicle.setAuth2ExitUserId(null);
                vehicle.setAuth2ExitUserName("");
                vehicle.setAuth2ExitDate(null);
                vehicle.setAuthExitStatus(this.deleteAuthExit(vehicle.getAuthExitStatus()));
                this.repository.save(vehicle);
            }
            return response;
        } catch (Exception ex) {
            throw new VehicleEntryException(ex.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse saveImage(MultipartFile file, String local) {
        try {
            MessageResponse response = new MessageResponse();
            response.setStatus(ConstantsMessage.SUCCESS);
            response.setHeader("Imagem");
            response.setMessage("Salvo com sucesso.");

            // Segurança básica
            if (local.contains("..") || local.isBlank()) {
                response.setStatus(ConstantsMessage.ERROR);
                response.setMessage("Caminho inválido.");
                return response;
            }

            // Nome do arquivo
            Path filePath = Paths.get(UPLOAD_DIR + local);

            // Cria diretórios se necessário
            Files.createDirectories(filePath.getParent());

            // Salva ou substitui se existir)
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // URL pública
            String url = "/images/" + local;

            // Retornar o caminho do arquivo salvo
            Map<String, String> map = new HashMap<>();
            map.put("url", url);

            response.setData(map);
            return response;
        } catch (Exception e) {
            throw new Exception(e.getMessage());
        }
    }

    @SneakyThrows
    @Override
    public MessageResponse deleteImage(String local) {
        try {
            MessageResponse response = new MessageResponse();
            response.setStatus(ConstantsMessage.SUCCESS);
            response.setHeader("Imagem");
            response.setMessage("Excluído com sucesso.");

            Path basePath = Paths.get(UPLOAD_DIR).toAbsolutePath().normalize();

            Path filePath = basePath.resolve(local).normalize();

            // Proteção contra path traversal
            if (!filePath.startsWith(basePath) || local.isBlank()) {
                response.setStatus(ConstantsMessage.ERROR);
                response.setMessage("Caminho inválido.");
                return response;
            }

            if (!Files.exists(filePath) || !Files.isRegularFile(filePath)) {
                response.setStatus(ConstantsMessage.ERROR);
                response.setMessage("Imagem não encontrada.");
                return response;
            }

            Files.delete(filePath);
            return response;
        } catch (Exception e) {
            throw new Exception(e.getMessage());
        }
    }

//    private void updateBudget(VehicleEntry vehicle) {
//        //update client budget
//        Budget budget = this.repositoryBudget.filterVehicleId(vehicle.getCompanyId(), vehicle.getResaleId(), vehicle.getId());
//        budget.setClientCompanyId(vehicle.getClientCompanyId());
//        budget.setIdUserAttendant(vehicle.getIdUserAttendant());
//        this.repositoryBudget.save(budget);
//    }

//    private VehicleEntry loadVehicle(VehicleEntry vehicle) {
//        if (vehicle.getIdUserAttendant() == null || vehicle.getIdUserAttendant() == 0) {
//            vehicle.setIdUserAttendant(null);
//            vehicle.setNameUserAttendant("");
//        }
//        if (vehicle.getClientCompanyId() == null || vehicle.getClientCompanyId() == 0) {
//            vehicle.setClientCompanyId(null);
//            vehicle.setClientCompanyName("");
//            vehicle.setClientCompanyCnpj("");
//            vehicle.setClientCompanyCpf("");
//            vehicle.setClientCompanyRg("");
//        }
//        if (vehicle.getIdUserExitAuth1() == null || vehicle.getIdUserExitAuth1() == 0) {
//            vehicle.setIdUserExitAuth1(null);
//            vehicle.setNameUserExitAuth1("");
//            vehicle.setDateExitAuth1(null);
//        }
//        if (vehicle.getIdUserExitAuth2() == null || vehicle.getIdUserExitAuth2() == 0) {
//            vehicle.setIdUserExitAuth2(null);
//            vehicle.setNameUserExitAuth2("");
//            vehicle.setDateExitAuth2(null);
//        }
//        return vehicle;
//    }

    private StatusAuthExitEnum statusAuthorization(VehicleEntry vehicle) {
        if (vehicle.getAuthExitStatus() == StatusAuthExitEnum.NotAuth) {
            return StatusAuthExitEnum.FirstAuth;
        } else if (vehicle.getAuthExitStatus() == StatusAuthExitEnum.FirstAuth) {
            return StatusAuthExitEnum.Authorized;
        }
        return StatusAuthExitEnum.NotAuth;
    }

    private StatusAuthExitEnum deleteAuthExit(StatusAuthExitEnum status) {
        //Status Authorization exit
        if (status == StatusAuthExitEnum.FirstAuth) {
            return StatusAuthExitEnum.NotAuth;
        } else if (status == StatusAuthExitEnum.Authorized) {
            return StatusAuthExitEnum.FirstAuth;
        }
        return status;
    }

    private String sendNotification(String type, VehicleEntry vehicle, Integer permissionId, User userOrig) {
        List<PermissionUser> permissions = this.permissionUser.filterPermissionId(userOrig.getCompanyId(), userOrig.getResaleId(), permissionId);
        if (permissions.isEmpty()) {
            return ConstantsMessage.ERROR;
        }
        Notification n = new Notification();
        n.setCompanyId(userOrig.getCompanyId());
        n.setResaleId(userOrig.getResaleId());
        n.setOrigUserId(userOrig.getId());
        n.setOrigUserName(userOrig.getName());
        n.setOrigRoleId(userOrig.getRoleId());
        n.setOrigRoleDesc(userOrig.getRoleDesc());
        n.setOrigDate(new Date());
        n.setOrigId(vehicle.getId().toString());
        n.setMessage3("");
        switch (type) {
            case "Entry":
                n.setOrigNotificationMenu(NotificationMenu.Concierge_Vehicle_Entry);
                n.setHeader("Entrada de Veículo");
                n.setMessage1("realizou a entrada do veículo.");
                if (vehicle.getVehicleNew() == YesNot.yes) {
                    n.setMessage2(vehicle.getId() + ", novo, " + vehicle.getModelDescription());
                } else {
                    n.setMessage2(vehicle.getId() + ", " + vehicle.getVehiclePlate() + ", " + vehicle.getModelDescription());
                }
                break;
            case "Exit":
                n.setOrigNotificationMenu(NotificationMenu.Concierge_Vehicle_Exit);
                n.setHeader("Saída de Veículo");
                n.setMessage1("realizou a saída do veículo.");
                if (vehicle.getVehicleNew() == YesNot.yes) {
                    n.setMessage2(vehicle.getId() + ", novo, " + vehicle.getModelDescription());
                } else {
                    n.setMessage2(vehicle.getId() + ", " + vehicle.getVehiclePlate() + ", " + vehicle.getModelDescription());
                }
                break;
        }
        //Save notification
        Notification resultNotification = this.notificationService.save(n);
        for (PermissionUser p : permissions) {
            User u = this.userRepository.filterId(vehicle.getCompanyId(), vehicle.getResaleId(), p.getUserId());
            NotificationUser nuDest = new NotificationUser();
            nuDest.setCompanyId(userOrig.getCompanyId());
            nuDest.setResaleId(userOrig.getResaleId());
            nuDest.setNotificationId(resultNotification.getId());
            nuDest.setUserId(u.getId());
            this.notificationUserService.save(nuDest);
        }
        return ConstantsMessage.SUCCESS;
    }
}
