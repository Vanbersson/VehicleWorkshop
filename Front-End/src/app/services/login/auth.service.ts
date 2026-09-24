import { IAuth } from '@/app/interfaces/i.auth';
import { MessageResponse } from '@/app/models/message-response';
import { User } from '@/app/models/user';
import { environment } from '@/environments/environment';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) { }

  login(login: IAuth): Observable<HttpResponse<User>> {
    return this.http.post<User>(environment.apiuUrl + "/auth/login", login, { observe: "response" });
  }

  isAuthenticated(): boolean {

    const token = localStorage.getItem('token');

    if (!token) {
      localStorage.clear();
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      const valid = payload.exp * 1000 > Date.now();

      if (!valid) {
        localStorage.clear();
      }

      return valid;

    } catch {
      localStorage.clear();
      return false;
    }
  }
}
