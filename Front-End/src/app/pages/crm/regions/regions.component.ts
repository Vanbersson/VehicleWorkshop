import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { lastValueFrom } from 'rxjs';
import { Router } from '@angular/router';

import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { MessageService, TreeNode } from 'primeng/api';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-regions',
  standalone: true,
  imports: [ToastModule, ReactiveFormsModule, InputTextModule, PasswordModule,
    InputTextModule, ButtonModule],
  templateUrl: './regions.component.html',
  styleUrl: './regions.component.scss',
})
export default class RegionsComponent {
 

}
