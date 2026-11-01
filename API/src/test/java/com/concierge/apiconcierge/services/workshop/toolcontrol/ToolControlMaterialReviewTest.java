package com.concierge.apiconcierge.services.workshop.toolcontrol;
import com.concierge.apiconcierge.services.workshop.toolcontrol.material.ToolControlMaterialService;
import com.concierge.apiconcierge.validation.workshop.toolcontrol.material.ToolControlMaterialValidation;
import com.concierge.apiconcierge.validation.workshop.toolcontrol.material.IToolControlMaterialValidation;
import com.concierge.apiconcierge.repositories.workshop.toolcontrol.*;
import com.concierge.apiconcierge.models.workshop.toolcontrol.*;
import com.concierge.apiconcierge.models.workshop.toolcontrol.enums.*;
import com.concierge.apiconcierge.models.enums.StatusEnableDisable;
import com.concierge.apiconcierge.models.message.MessageResponse;
import com.concierge.apiconcierge.util.ConstantsMessage;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.mock.web.MockMultipartFile;
import java.nio.file.*;
import java.math.BigDecimal;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
class ToolControlMaterialReviewTest {
 IToolControlMaterialRepository repository=mock(IToolControlMaterialRepository.class);
 IToolControlCategoryRepository categories=mock(IToolControlCategoryRepository.class);
 IToolControlMatMecRepository loans=mock(IToolControlMatMecRepository.class);
 IToolControlKitMecRepository kits=mock(IToolControlKitMecRepository.class);
 ToolControlMaterialValidation validation=new ToolControlMaterialValidation();
 ToolControlMaterialService service=new ToolControlMaterialService();
 @TempDir Path images;
 ToolControlMaterial material;
 @BeforeEach void setup(){
  ReflectionTestUtils.setField(validation,"categoryRepository",categories);
  ReflectionTestUtils.setField(service,"repository",repository);ReflectionTestUtils.setField(service,"validation",validation);
  ReflectionTestUtils.setField(service,"categoryRepository",categories);ReflectionTestUtils.setField(service,"repositoryMatMec",loans);ReflectionTestUtils.setField(service,"repositoryKitMec",kits);ReflectionTestUtils.setField(service,"UPLOAD_DIR",images.toString());
  material=new ToolControlMaterial();material.setId(7);material.setCompanyId(1);material.setResaleId(2);material.setCategoryId(4);material.setStatus(StatusEnableDisable.Habilitado);material.setType(TypeRequest.Kit);material.setDescription("Tool");material.setPhotoUrl("photo.jpg");material.setNumberCA(123);material.setQuantityAccountingLoan(new BigDecimal("10"));material.setQuantityAvailableLoan(new BigDecimal("10"));material.setQuantityAccountingKit(new BigDecimal("10"));material.setQuantityAvailableKit(new BigDecimal("10"));
  ToolControlCategory category=new ToolControlCategory();category.setType(TypeCategory.Ferramenta);when(categories.filterId(1,2,4)).thenReturn(category);
  when(repository.filterId(1,2,7)).thenReturn(material);when(repository.save(any())).thenAnswer(inv->inv.getArgument(0));when(loans.filterMatIdDevPend(1,2,7)).thenReturn(List.of());when(kits.filterMatIdDevPend(1,2,7)).thenReturn(List.of());
 }
 @Test void kitUpdatesAreActuallyPersisted(){assertEquals(ConstantsMessage.SUCCESS,service.update(material).getStatus());verify(repository).save(material);}
 @Test void kitAvailabilityIsCalculatedFromOutstandingAssignments(){ToolControlKitMec kit=new ToolControlKitMec();kit.setQuantityReq(4);kit.setQuantityRet(1);when(kits.filterMatIdDevPend(1,2,7)).thenReturn(List.of(kit));service.update(material);assertEquals(0,new BigDecimal("7").compareTo(material.getQuantityAvailableKit()));}
 @Test void cannotReduceAccountingBelowOutstandingLoans(){material.setType(TypeRequest.Loan);material.setQuantityAccountingLoan(BigDecimal.ONE);ToolControlMatMec loan=new ToolControlMatMec();loan.setDeliveryQuantity(new BigDecimal("2"));when(loans.filterMatIdDevPend(1,2,7)).thenReturn(List.of(loan));assertEquals(ConstantsMessage.ERROR,service.update(material).getStatus());verify(repository,never()).save(any());}
 @Test void canReduceAccountingWithStaleReadOnlyAvailability(){material.setQuantityAccountingKit(new BigDecimal("5"));assertEquals(ConstantsMessage.SUCCESS,service.update(material).getStatus());assertEquals(0,new BigDecimal("5").compareTo(material.getQuantityAvailableKit()));}
 @Test void cannotUpdateMissingMaterialInRequestedResale(){when(repository.filterId(1,2,7)).thenReturn(null);assertEquals(ConstantsMessage.ERROR,service.update(material).getStatus());verify(repository,never()).save(any());}
 @Test void rejectsMissingDescriptionAndQuantitiesWithoutNullPointer(){material.setDescription(null);assertEquals(ConstantsMessage.ERROR,validation.save(material).getStatus());material.setDescription("Valid");material.setQuantityAccountingKit(null);assertEquals(ConstantsMessage.ERROR,validation.update(material).getStatus());}
 @Test void comparesActualQuantitiesRatherThanTheirSigns(){material.setQuantityAvailableLoan(new BigDecimal("20"));assertEquals(ConstantsMessage.ERROR,validation.save(material).getStatus());}
 @Test void rejectsNegativeKitQuantities(){material.setQuantityAccountingKit(new BigDecimal("-1"));assertEquals(ConstantsMessage.ERROR,validation.save(material).getStatus());}
 @Test void rejectsUnknownCategoryAndIncompatibleEpiType(){when(categories.filterId(1,2,4)).thenReturn(null);assertEquals(ConstantsMessage.ERROR,validation.save(material).getStatus());ToolControlCategory epi=new ToolControlCategory();epi.setType(TypeCategory.EPI);when(categories.filterId(1,2,4)).thenReturn(epi);assertEquals(ConstantsMessage.ERROR,validation.save(material).getStatus());}
 @Test void listIncludesPhotoAndCertificate(){when(repository.listAll(1,2)).thenReturn(List.of(material));var row=service.listAll(1,2).get(0);assertEquals("photo.jpg",row.get("photoUrl"));assertEquals(123,row.get("numberCA"));}
 @Test void imagePathsCannotEscapeMaterialDirectory(){var file=new MockMultipartFile("file","image.jpg","image/jpeg",new byte[]{1});assertEquals(ConstantsMessage.ERROR,service.saveImage(file,"../image.jpg").getStatus());assertEquals(ConstantsMessage.ERROR,service.deleteImage("/outside.jpg").getStatus());}
 @Test void rejectsNonImageAndMissingImageDeletionIsIdempotent(){var file=new MockMultipartFile("file","image.jpg","image/jpeg",new byte[]{1,2,3});String local="1/2/workshop/equipment/reg/material/7/image1.jpg";assertEquals(ConstantsMessage.ERROR,service.saveImage(file,local).getStatus());assertEquals(ConstantsMessage.SUCCESS,service.deleteImage(local).getStatus());}
}
