import { HttpResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { Router } from '@angular/router';

import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageService, TreeNode } from 'primeng/api';

import { MessageResponse } from '@/app/models/message-response';
import { IAuth } from '@/app/interfaces/i.auth';
import { AuthService } from '@/app/services/login/auth.service';
import { MenuUserService } from '@/app/services/menu/menu-user.service';
import { StatusSuccessError } from '@/app/models/status-suc-err';
import { User } from '@/app/models/user';
import { StorageService } from '@/app/services/storage/storage.service';
import { LoadingService } from '@/app/services/loading/loading.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ToastModule, ReactiveFormsModule, InputTextModule, PasswordModule,
    InputTextModule, ButtonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  providers: [MessageService]
})
export default class Login {
  private user: User = new User();
  formLogin = new FormGroup({
    email: new FormControl<string>('', Validators.required),
    password: new FormControl<string>('', [Validators.required, Validators.minLength(8)])
  });

  constructor(private loading: LoadingService,
    private messageService: MessageService,
    private storageService: StorageService,
    private authService: AuthService,
    private menuService: MenuUserService,
    private router: Router) { }

  async login() {
    const { value, valid } = this.formLogin;
    if (!valid) {
      return;
    }
    const login: IAuth = { email: value.email!, password: value.password! };
    this.loading.show();
    const result = await this.loginService(login);
    this.loading.hide();
    if (result.status == 200) {
      this.user = result.body!;
      this.messageService.add({ severity: 'success', summary: 'Login', detail: `Bem-Vindo ${this.user.name}` , icon: 'pi pi-check' });
      this.storageService.companyId = this.user.companyId!.toString();
      this.storageService.resaleId = this.user.resaleId!.toString();
      this.storageService.photo = this.user.photoUrl;
      this.storageService.id = this.user.id!.toString();
      this.storageService.name = this.user.name;
      this.storageService.email = this.user.email;
      this.storageService.cellphone = this.user.cellphone;
      this.storageService.roleDesc = this.user.roleDesc;
      this.storageService.roleFunc = this.user.roleFunc;
      this.storageService.limitDiscount = this.user.limitDiscount.toString();
      this.storageService.token = this.user.token;
      const resultMenus = await this.menusUser(this.user.companyId!, this.user.resaleId!, this.user.id!);
      var keys = "";
      for (let a = 0; a < resultMenus.length; a++) {
        const element = resultMenus[a];
        keys += element.key + ",";
      }
      this.storageService.menus = keys;
      setTimeout(() => {
        this.router.navigateByUrl('/');
      }, 1000);
    }
  }

  private async loginService(login: IAuth): Promise<HttpResponse<User>> {
    try {
      return await lastValueFrom(this.authService.login(login));
    } catch (error: any) {
      this.messageService.add({ severity: 'error', summary: 'Login', detail: 'Usuário ou senha inválida', icon: 'pi pi-times' });
      return error;
    }
  }
  
  private async menusUser(compamyId: number, resaleId: number, userId: number): Promise<TreeNode[]> {
    try {
      return await lastValueFrom(this.menuService.listMenusUser(compamyId, resaleId, userId));
    } catch (error: any) {
      return [];
    }
  }
}
