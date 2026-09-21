import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import { StorageService } from '../../services/storage/storage.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [CommonModule, ToastModule, ConfirmDialogModule, ButtonModule],
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.scss',
  providers: [ConfirmationService, MessageService]
})
export class LogoutComponent {

  constructor(private router: Router,
    private confirmationService: ConfirmationService,
    private storageService: StorageService) { }

  exit() {
    this.confirmationService.confirm({
      header: 'Sair?',
      message: 'Deseja realmente sair?',
      accept: () => {
        localStorage.clear();
        this.router.navigateByUrl("/auth");
      },
      reject: () => {
      }
    });
  }

}
