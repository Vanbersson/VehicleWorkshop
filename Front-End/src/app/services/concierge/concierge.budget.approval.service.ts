import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@/environments/environment';
import { ConciergeBudgetApprovalData } from '@/app/models/concierge.budget.approval';
@Injectable({ providedIn: 'root' })
export class ConciergeBudgetApprovalService {
    private readonly http = inject(HttpClient);
    private url(token: string): string {
        return environment.apiuUrl + '/public/concierge-budgets/' + encodeURIComponent(token);
    }
    load(token: string) {
        return this.http.get<ConciergeBudgetApprovalData>(this.url(token) + '/data', { withCredentials: true });
    }
    verify(token: string, taxId: string) {
        return this.http.post<ConciergeBudgetApprovalData>(this.url(token) + '/verify', { taxId }, { withCredentials: true });
    }
    approve(token: string) {
        return this.http.post<ConciergeBudgetApprovalData>(this.url(token) + '/confirm', { confirmed: true }, { withCredentials: true });
    }
    download(token: string) {
        return this.http.get(this.url(token) + '/file', { withCredentials: true, responseType: 'blob' });
    }
}
