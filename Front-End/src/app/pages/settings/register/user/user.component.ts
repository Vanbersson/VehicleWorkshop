import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, UpperCasePipe } from '@angular/common';
import { environment } from '@/environments/environment';
import { FormControl, FormsModule, ReactiveFormsModule, FormGroup, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { HttpResponse } from '@angular/common/http';
//PrimeNG
import { TableModule } from 'primeng/table'
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputNumberModule } from 'primeng/inputnumber';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { InputMaskModule } from 'primeng/inputmask';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToastModule } from 'primeng/toast';
import { MessageService, TreeNode } from 'primeng/api';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { AvatarModule } from 'primeng/avatar';
import { ImageModule } from 'primeng/image';
import { DialogModule } from 'primeng/dialog';
import { TreeModule } from 'primeng/tree';
import { DividerModule } from 'primeng/divider';

import { LoadingService } from '@/app/services/loading/loading.service';
import { UserService } from '@/app/services/user/user.service';
import { StorageService } from '@/app/services/storage/storage.service';
import { PhotoService } from '@/app/services/photo/photo.service';
import { StatusEnabDisabEnum } from '@/app/models/status-enab-disab-enum';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { MessageResponse } from '@/app/models/message-response';
import { User } from '@/app/models/user';
import { UserRoleService } from '@/app/services/user/user.role.service';
import { StatusRoleFuncEnum } from '@/app/models/status-role-func-enum';
import { UserRole } from '@/app/models/user.role';
import { Permission } from '@/app/models/permission';
import { PermissionService } from '@/app/services/permission/permission.service';
import { PermissionUser } from '@/app/models/permission.user';
import { IPhotoResult } from '@/app/interfaces/i.photo-result';
import { MenuUserService } from '@/app/services/menu/menu-user.service';
import { MenuUser } from '@/app/models/menu-user';
import { StatusPhotoResult } from '@/app/models/status-photo-result';
import { PermissionUserService } from '@/app/services/permission/permission.user.service';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TableModule, InputTextModule, TreeModule, IconFieldModule, InputIconModule,
    InputNumberModule, InputMaskModule, MultiSelectModule, SelectModule, ToastModule, DialogModule, PasswordModule, DividerModule,
    ImageModule, ButtonModule, AvatarModule, RadioButtonModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
  providers: [MessageService]
})
export default class UserComponent implements OnInit {
  private userSelect!: User;
  users = signal<User[]>([]);
  roles: UserRole[] = [];

  //Dialog
  visibleDialogUser: boolean = false;
  userName!: string;
  userPhoto = signal<string>('');
  isPhotoNew: boolean = false;
  isPhotoDelete: boolean = true;
  userEmail!: string;
  userRoleDescription!: string;
  isEditUser: boolean = false;

  enabled = StatusEnabDisabEnum.ENABLED;
  disabled = StatusEnabDisabEnum.DISABLED;

  admin = StatusRoleFuncEnum.ADMIN;
  user = StatusRoleFuncEnum.USER;

  formUser = new FormGroup({
    id: new FormControl<number | null>(null),
    status: new FormControl<StatusEnabDisabEnum>({ value: StatusEnabDisabEnum.DISABLED, disabled: false }),
    name: new FormControl<string>('', Validators.required),
    email: new FormControl<string>('', [Validators.email, Validators.required]),
    cellphone: new FormControl<string>(''),
    roleDesc: new FormControl<UserRole | null>(null, Validators.required),
    roleFunc: new FormControl<StatusRoleFuncEnum>(StatusRoleFuncEnum.USER, Validators.required),
    limitDiscount: new FormControl<number>(0),
    password: new FormControl<string>(''),
    passwordValid: new FormControl<string>(''),
  });

  //Dialog Permission
  visibleDialogPerm: boolean = false;
  permissions = signal<Permission[]>([]);
  permissionsSelect = signal<Permission[]>([]);
  permissionUser: Permission[] = [];

  //Dialog Menus
  visibleDialogMenu: boolean = false;
  menus: TreeNode[] = [];
  menuSelect = signal<TreeNode[]>([]);

  //Update password 
  private userPass!: User;
  visibleUpdatePass: boolean = false;
  nameUserUpdatePass!: string;
  formPassword = new FormGroup({
    password: new FormControl<string>('', [Validators.minLength(8), Validators.required]),
    passwordValid: new FormControl<string>('', [Validators.minLength(8), Validators.required]),
  });

  constructor(
    private loadingService: LoadingService,
    private userService: UserService,
    private storageService: StorageService,
    private userRoleService: UserRoleService,
    private permissionService: PermissionService,
    private permissionUserService: PermissionUserService,
    private menuUserService: MenuUserService,
    private messageService: MessageService,
    private photoService: PhotoService) { }

  ngOnInit(): void {

    this.menus = [
      { key: '0_0', label: 'Dashboard', icon: 'pi pi-home' },
      {
        key: '1_0', label: 'Portaria', children: [
          { key: '1_1', label: 'Entrada de Veículo', },
          { key: '1_2', label: 'Veículos' },
          { key: '1_5', label: 'Saída de Veiculo' },
          { key: '1_3', label: 'Motorista' },
          {
            key: '1_99', label: 'Cadastros', children: [
              { key: '1_99_0', label: 'Modelo' },
              { key: '1_99_1', label: 'Veículo' },
            ]
          },
          { key: '1_100', label: 'Módulo' }
        ]
      },
      {
        key: '2_0', label: 'Peças', children: [
          { key: '2_1', label: 'Atendimento' },
          {
            key: '2_2', label: 'Consultas', children: [
              { key: '2_2_0', label: 'Orçamentos' },
            ]

          },
          {
            key: '2_3', label: 'Compras', children: [
              { key: '2_3_0', label: 'Pedidos de Compra' },
            ]
          },
          {
            key: '2_99', label: 'Cadastros', children: [
              { key: '2_99_0', label: 'Peças' },
              { key: '2_99_1', label: 'Grupo de Peças' },
              { key: '2_99_2', label: 'Categoria de Peças' },
              { key: '2_99_3', label: 'Unidades de Medida' },
            ]
          },
          { key: '2_100', label: 'Módulo' },
        ]
      },
      {
        key: '3_0', label: 'Oficina', children: [
          { key: '3_1', label: 'Atendimento Oficina' },
          {
            key: '3_2', label: 'Controle de equipamentos', children: [
              { key: '3_2_0', label: 'Requisições' },
              {
                key: '3_2_1', label: 'Cadastros', children: [
                  { key: '3_2_1_0', label: 'Categoria' },
                  { key: '3_2_1_1', label: 'Material' },
                ]
              }
            ]
          },
          { key: '3_3', label: 'Orçamentos' },
          {
            key: '3_99', label: 'Cadastros', children: [
              { key: '3_99_0', label: 'Mecânico' },
              { key: '3_99_1', label: 'Departamentos' },
            ]
          }
        ]
      },
      {
        key: '4_0', label: 'Faturamento', children: [
          { key: '4_1', label: 'Manutenção Clientes' },
          {
            key: '4_99', label: 'Cadastros', children: [
              { key: '4_99_0', label: 'Categoria de Clientes' },
              { key: '4_99_1', label: 'Condição de pagamento' }
            ]
          },
        ]
      },
      {
        key: '5_0', label: 'CRM', children: [
          { key: '5_1', label: 'Mapa' },
          {
            key: '5_99', label: 'Cadastros', children: [
              { key: '5_99_0', label: 'Vendedores' }
            ]
          },
        ]
      },
      {
        key: '100_0', label: 'Relatório', children: [
          {
            key: '100_1', label: 'Portaria', children: [
              { key: '100_1_0', label: 'Veículos' },
            ]
          },
          {
            key: '100_2', label: 'Peças', children: [
              { key: '100_2_0', label: 'Pedidos de compras' },
            ]
          }
          ,
          {
            key: '100_3', label: 'Oficina', children: [
              {
                key: '100_3_0', label: 'Controle de equipamentos', children: [
                  { key: '100_3_1', label: 'Requisições' },
                ]
              },
            ]
          }
        ]
      },
      {
        key: '999_0', label: 'Configurações', children: [
          {
            key: '999_2', label: 'Cadastros', children: [
              { key: '999_2_0', label: 'Empresa', icon: 'pi pi-building' },
              { key: '999_2_1', label: 'Usuários', icon: 'pi pi-users' },
              { key: '999_2_2', label: 'Marcas' },
            ]
          },

        ]
      },

    ];

    this.getUsers();
    this.getRoles();
    this.getPermissions();
  }

  showUpdatePass(user: User) {
    this.userPass = new User();
    this.userPass = user;
    this.visibleUpdatePass = true;
    this.nameUserUpdatePass = user.name;
  }
  async saveUpdatePassword() {
    const { valid } = this.formPassword;
    if (!valid) {
      return;
    }
    try {
      const formData = new FormData();
      formData.append("companyId", this.userPass.companyId!.toString());
      formData.append("resaleId", this.userPass.resaleId!.toString());
      formData.append("id", this.userPass.id!.toString());
      formData.append("password", this.formPassword.get("password")?.value!);

      this.loadingService.show();
      const resultUser = await this.updatePassword(formData);
      this.loadingService.hide();
      if (resultUser.status == 200 && resultUser.body?.status == StatusSuccessError.succes) {
        this.messageService.add({ severity: 'success', summary: resultUser.body.header, detail: resultUser.body.message, icon: 'pi pi-check' });
      }
      if (resultUser.status == 200 && resultUser.body?.status == StatusSuccessError.error) {
        this.messageService.add({ severity: 'info', summary: resultUser.body.header, detail: resultUser.body.message, icon: 'pi pi-info-circle' });
      }
    } catch (error) {

    }
    this.visibleUpdatePass = false;
    this.userPass = null!;
  }
  //Password
  private addRequirePass() {
    this.formUser.controls['password'].addValidators([Validators.minLength(8), Validators.required]);
    this.formUser.controls['password'].updateValueAndValidity();
  }
  private deleteRequirePass() {
    this.formUser.controls['password'].removeValidators([Validators.minLength(8), Validators.required]);
    this.formUser.controls['password'].updateValueAndValidity();
  }
  //Password Valid
  private addRequirePassValid() {
    this.formUser.controls['passwordValid'].addValidators([Validators.minLength(8), Validators.required]);
    this.formUser.controls['passwordValid'].updateValueAndValidity();
  }
  private deleteRequirePassValid() {
    this.formUser.controls['passwordValid'].removeValidators([Validators.minLength(8), Validators.required]);
    this.formUser.controls['passwordValid'].updateValueAndValidity();
  }
  private async getUsers() {
    this.loadingService.show();
    const result = await this.listAllUsers();
    this.loadingService.hide();
    if (result.status == 200 && result.body?.status == StatusSuccessError.succes) {
      //this.messageService.add({ severity: 'success', summary: result.body.header, detail: result.body.message, icon: 'pi pi-check' });
      this.users.set(result.body.data);
    } else if (result.status == 200 && result.body?.status == StatusSuccessError.error) {
      this.messageService.add({ severity: 'info', summary: result.body.header, detail: result.body.message, icon: 'pi pi-info-circle' });
    }
  }
  private async listAllUsers(): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.userService.listAll());
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private getRoles() {
    this.userRoleService.listAllEnabled().subscribe(data => {
      this.roles = data;
    })
  }
  public firstLetter(user: User): string {
    let pipe = new UpperCasePipe();
    let iniciais = "";
    let names = user.name.split(' ');
    try {
      iniciais = names.at(0)!.substring(0, 1);
      iniciais = iniciais + "" + names.at(1)!.substring(0, 1);
      return pipe.transform(iniciais);
    } catch {
      iniciais = names.at(0)!.substring(0, 1);
      return pipe.transform(iniciais);;
    }
  }

  public showDialogSave() {
    this.isEditUser = false;

    //disable ID
    this.formUser.get('id')!.disable();
    //enable password
    this.formUser.get('password')!.enable();
    this.formUser.get('passwordValid')!.enable();

    this.userSelect = null!;
    this.cleanForm();
    this.visibleDialogUser = true;
    this.menuSelect.set([]);
    this.addRequirePass();
    this.addRequirePassValid();
  }
  async editUser(id: number) {
    const resultUser = await this.filterUserId(id);
    if (resultUser.status == 200 && resultUser.body?.status == StatusSuccessError.succes) {
      this.isEditUser = true;
      this.showDialogEdit(resultUser.body.data);
    }
    if (resultUser.status == 200 && resultUser.body?.status == StatusSuccessError.error) {
      this.messageService.add({ severity: 'info', summary: resultUser.body.header, detail: resultUser.body.message, icon: 'pi pi-info-circle' });
    }
  }
  private async filterUserId(id: number): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.userService.filterId(id));
    } catch (error: any) {
      return error;
    }
  }
  private showDialogEdit(user: User) {
    this.cleanForm();
    //show dialog
    this.visibleDialogUser = true;
    //disable ID
    this.formUser.get('id')!.disable();
    //disable password
    this.formUser.get('password')!.disable();
    this.formUser.get('passwordValid')!.disable();
    //remove a requisição
    this.deleteRequirePass();
    this.deleteRequirePassValid();
    //Data user
    this.userSelect = user;

    var roleSelect!: UserRole;
    this.userPhoto.set(user.photoUrl);

    for (var role of this.roles) {
      if (role.id == user.roleId) {
        roleSelect = role;
      }
    }

    this.formUser.patchValue({
      id: user.id,
      name: user.name,
      email: user.email,
      cellphone: user.cellphone,
      limitDiscount: user.limitDiscount,
      roleDesc: roleSelect,
      roleFunc: user.roleFunc,
      status: user.status
    });
    //Menus
    this.getMenusUser();
    //Permission
    this.getPermissionUser();
  }




  public hideDialogUser() {
    this.visibleDialogUser = false;
  }
  private cleanForm() {
    this.userPhoto.set('');
    this.formUser.patchValue({
      id: null,
      name: '',
      email: '',
      cellphone: '',
      limitDiscount: 0,
      roleDesc: null,
      roleFunc: StatusRoleFuncEnum.USER,
      status: StatusEnabDisabEnum.ENABLED,
      password: '',
      passwordValid: ''
    });
  }
  public async selectPhoto() {
    const photo: IPhotoResult = await this.photoService.takePicture();
    if (photo.status == StatusPhotoResult.SUCCESS) {
      this.userPhoto.set(photo.base64!);
      //informa que foi selecionado uma imagem nova
      this.isPhotoNew = true;
      //informa que não excluida a imagem
      this.isPhotoDelete = false;
    }
    if (photo.status == StatusPhotoResult.LIMIT) {
      this.messageService.add({ severity: 'info', summary: 'Imagem', detail: this.photoService.maxSiseLabel, icon: 'pi pi-info-circle', life: 3000 });
    }
    if (photo.status == StatusPhotoResult.ERROR) {
      // this.messageService.add({ severity: 'error', summary: 'Erro', detail: "Ocorreu um problema.", icon: 'pi pi-times', life: 3000 });
    }
  }
  public deletePhoto() {
    this.userPhoto.set('');
    //informa que foi excluida a imagem
    this.isPhotoDelete = true;
    //informa que não foi selecionado uma imagem nova
    this.isPhotoNew = false;
  }
  public saveData() {
    const { valid } = this.formUser;
    if (this.isEditUser == false) {
      if (valid) {
        this.saveUser();
      }
    } else {
      if (valid) {
        this.updateUser();
      }
    }
  }
  private async saveUser() {
    const { value } = this.formUser;
    var userNew = new User();

    userNew.photoUrl = this.userPhoto();
    userNew.companyId = this.storageService.companyId;
    userNew.resaleId = this.storageService.resaleId;
    userNew.name = value.name!;
    userNew.email = value.email!;
    userNew.cellphone = value.cellphone ?? "";
    userNew.limitDiscount = value.limitDiscount ?? 0;
    userNew.password = value.password!;
    userNew.roleId = value.roleDesc!.id;
    userNew.roleDesc = value.roleDesc!.description;
    userNew.roleFunc = value.roleFunc!;
    userNew.status = value.status!;
    this.loadingService.show();
    const resultSave = await this.saveNewUser(userNew);
    this.loadingService.hide();
    if (resultSave.status == 201 && resultSave.body?.status == StatusSuccessError.succes) {
      this.messageService.add({ severity: 'success', summary: resultSave.body.header, detail: resultSave.body.message, icon: 'pi pi-check' });

      this.formUser.get('id')!.setValue(resultSave.body.data.id);
      this.userSelect = userNew;
      this.userSelect.id = resultSave.body.data.id;
      this.isEditUser = true;
      this.getUsers();
    }
    if (resultSave.status == 201 && resultSave.body?.status == StatusSuccessError.error) {
      this.messageService.add({ severity: 'info', summary: resultSave.body.header, detail: resultSave.body.message, icon: 'pi pi-info-circle' });
    }
  }

  private async saveNewUser(user: User): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.userService.saveUser(user));
    } catch (error: any) {
      return error;
    }
  }
  private async updateUser() {
    const { value } = this.formUser;
    if (this.isPhotoNew) {
      this.isPhotoNew = false;
      const img1 = await this.savePhoto(this.userSelect);
      this.userSelect.photoUrl = img1;
    }

    if (this.isPhotoDelete) {
      this.isPhotoDelete = false;
      const path =
        `${this.userSelect.companyId}/` +
        `${this.userSelect.resaleId}/users/` +
        `${this.userSelect.id}/profile/image.jpg`;
      const formdata = new FormData();
      formdata.append("local", path);
      const result = await this.deleteImage(formdata);
      this.userSelect.photoUrl = "";
    }

    this.userSelect.name = value.name!;
    this.userSelect.email = value.email!;
    this.userSelect.cellphone = value.cellphone!;
    this.userSelect.limitDiscount = value.limitDiscount!;
    this.userSelect.password = "";
    this.userSelect.roleId = value.roleDesc!.id;
    this.userSelect.roleDesc = value.roleDesc!.description;
    this.userSelect.roleFunc = value.roleFunc!;
    this.userSelect.status = value.status!;
    this.loadingService.show();
    const resultUpdate = await this.saveUpdateUser(this.userSelect);
    this.loadingService.hide();
    if (resultUpdate.status == 200 && resultUpdate.body?.status == StatusSuccessError.succes) {
      this.messageService.add({ severity: 'success', summary: resultUpdate.body.header, detail: resultUpdate.body.message, icon: 'pi pi-check' });
      this.getUsers();
    }
    if (resultUpdate.status == 200 && resultUpdate.body?.status == StatusSuccessError.error) {
      this.messageService.add({ severity: 'info', summary: resultUpdate.body.header, detail: resultUpdate.body.message, icon: 'pi pi-info-circle' });
    }
  }
  private async saveUpdateUser(user: User): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.userService.updateUser(user));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: "Não catalogado.", icon: 'pi pi-times' });
      return error;
    }
  }
  private async updatePassword(data: FormData): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.userService.updatePassword(data));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: "Não catalogado.", icon: 'pi pi-times' });
      return error;
    }
  }

  //save image
  private async savePhoto(user: User): Promise<string> {
    if (this.userPhoto() == "") {
      return "";
    }

    //Tentar salvar a foto
    try {
      const { base64, mime } = this.cleanBase64(this.userPhoto());
      const imageFile = this.base64ToFile(base64, mime);

      const path =
        `${user.companyId}/` +
        `${user.resaleId}/users/` +
        `${user.id}/profile/`;

      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('local', path);

      const resultSave = await this.saveImage(formData);
      if (resultSave.status === 200 && resultSave.body?.status === StatusSuccessError.succes) {
        return `${environment.apiuUrl}${resultSave.body.data["url"]}`;
      }
    } catch (error) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao salvar imagem de perfil' });
    }
    return "";
  }
  private cleanBase64(base64: string): { base64: string; mime: string } {
    if (!base64.includes(',')) {
      return { base64, mime: 'image/jpeg' };
    }

    const [header, data] = base64.split(',');
    const mime = header.match(/data:(.*);base64/)?.[1] || 'image/jpeg';

    return { base64: data, mime };
  }
  private base64ToFile(base64: string, mime: string): File {
    const byteString = atob(base64);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);

    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new File([ia], 'image.jpg', { type: mime });
  }
  private async deleteImage(data: FormData): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.userService.deleteImage(data));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async saveImage(data: FormData): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.userService.uploadImage(data))
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }

  //#Permissões
  public showDialogFunc() {
    if (this.userSelect) {
      this.visibleDialogPerm = true;
    } else {
      this.messageService.add({ severity: 'info', summary: 'Seleção', detail: 'Selecione um usuário', icon: 'pi pi-info-circle' });
    }
  }
  public hideDialogFunc() {
    this.visibleDialogPerm = false;
  }
  private getPermissions() {
    this.permissionService.listAll().subscribe(data => {
      this.permissions.set(data);
    });
  }
  private async getPermissionUser() {
    this.permissionsSelect.set([]);
    const userPermissions = await this.filterUserPermission();
    const permissions = this.permissions().filter(per =>
      userPermissions.some(item => item.permissionId === per.id)
    );
    this.permissionsSelect.set(permissions);
  }
  public async savePermissions() {
    this.loadingService.show();
    let pUser = new PermissionUser();
    pUser.companyId = this.userSelect.companyId;
    pUser.resaleId = this.userSelect.resaleId;
    pUser.userId = this.userSelect.id;
    const responseDelete = await this.deletePermissionUser(pUser);
    if (responseDelete.status == 200 && responseDelete.body?.status == StatusSuccessError.succes) {
      for (let i = 0; i < this.permissionsSelect().length; i++) {
        const per = this.permissionsSelect()[i];
        pUser.permissionId = per.id;
        const responseSave = await this.savePermission(pUser);
        if (responseSave.status == 201) {
          if (i == (this.permissionsSelect.length - 1)) {
            this.alertPermisionSave();
            this.hideDialogFunc();
          }
        }
      }
    }
    this.loadingService.hide();
  }
  private async savePermission(per: PermissionUser): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.permissionUserService.save(per));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async updatePermission(per: PermissionUser): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.permissionUserService.update(per));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }

  private async filterUserPermission(): Promise<PermissionUser[]> {
    try {
      return await lastValueFrom(this.permissionUserService.filterUser(this.userSelect.companyId!, this.userSelect.resaleId!, this.userSelect.id!));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return [];
    }
  }

  private async listAllPermission(per: PermissionUser): Promise<Permission[]> {
    try {
      return await lastValueFrom(this.permissionService.listAll());
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return [];
    }
  }
  private async deletePermissionUser(permissionUser: PermissionUser): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.permissionUserService.deleteAllUser(permissionUser));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  //#Permissões
  //#Menus 
  public showDialogMenu() {
    if (this.userSelect) {
      this.visibleDialogMenu = true;
    } else {
      this.messageService.add({ severity: 'info', summary: 'Seleção', detail: 'Selecione um usuário', icon: 'pi pi-info-circle' });
    }
  }
  public hideDialogMenu() {
    this.visibleDialogMenu = false;
  }
  private async getMenusUser() {
    this.menuSelect.set([]);
    const menus = await this.listMenuUser(this.userSelect.companyId!, this.userSelect.resaleId!, this.userSelect.id!);
    this.menuSelect.set(menus);
  }
  public async saveMenus() {
    this.loadingService.show();
    var menuD: MenuUser = new MenuUser();
    menuD.companyId = this.userSelect.companyId;
    menuD.resaleId = this.userSelect.resaleId;
    menuD.userId = this.userSelect.id;
    const responseDelete = await this.deleteMenuUser(menuD);
    if (responseDelete.status == 200 && responseDelete.body?.status == StatusSuccessError.succes) {
      for (let index = 0; index < this.menuSelect().length; index++) {
        const item = this.menuSelect()[index];
        let menu: MenuUser = new MenuUser();
        menu.companyId = this.userSelect.companyId;
        menu.resaleId = this.userSelect.resaleId;
        menu.userId = this.userSelect.id;
        menu.menuId = item.key!;
        const responseSave = await this.saveMenuUser(menu);
        if (responseSave.status == 201) {
          if (index == this.menuSelect().length - 1) {
            this.alertMenusSave();
          }
        }
      }
      //Close Dialog
      this.visibleDialogMenu = false;
    } else {
      this.messageService.add({ severity: 'error', summary: 'Menu', detail: 'Erro na atualização dos menus.', icon: 'pi pi-times' });
    }
    this.loadingService.hide();
  }
  private async saveMenuUser(menu: MenuUser): Promise<HttpResponse<MessageResponse>> {
    try {

      return await lastValueFrom(this.menuUserService.save(menu));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async updateMenuUser(menu: MenuUser): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.menuUserService.update(menu));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async deleteMenuUser(menu: MenuUser): Promise<HttpResponse<MessageResponse>> {
    try {
      return await lastValueFrom(this.menuUserService.delete(menu));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return error;
    }
  }
  private async listMenuUser(companyId: number, resaleId: number, userId: number): Promise<TreeNode[]> {
    try {
      return await lastValueFrom(this.menuUserService.listMenusUser(companyId, resaleId, userId));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Erro', detail: error.error.message, icon: 'pi pi-times' });
      return [];
    }
  }
  //#Menus

  //Alert
  private alertPermisionSave() {
    this.messageService.add({ severity: 'success', summary: 'Permissões', detail: 'Salvo com sucesso', icon: 'pi pi-check', life: 3000 });
  }
  private alertMenusSave() {
    this.messageService.add({ severity: 'success', summary: 'Menus', detail: 'Salvo com sucesso', icon: 'pi pi-check', life: 3000 });
  }
}
