import { IAuth } from '@/app/interfaces/i.auth';
import { MessageResponse } from '@/app/models/message-response';
import { User } from '@/app/models/user';
import { environment } from '@/environments/environment';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export type LoginUser = User & { birthdayToday?: boolean };

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private birthdayGreeting: string | undefined;

    constructor(private http: HttpClient) {}

    login(login: IAuth): Observable<HttpResponse<LoginUser>> {
        return this.http.post<LoginUser>(environment.apiuUrl + '/auth/login', login, { observe: 'response' });
    }

    prepareBirthdayGreeting(user: LoginUser): void {
        this.birthdayGreeting = user.birthdayToday ? user.name : undefined;
    }

    takeBirthdayGreeting(): string | undefined {
        const greeting = this.birthdayGreeting;
        this.birthdayGreeting = undefined;
        return greeting;
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
