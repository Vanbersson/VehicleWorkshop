import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApprovalKind, ApprovalPageData } from '@/app/models/crm/approval.page';
import { environment } from '@/environments/environment';

@Injectable({ providedIn: 'root' })
export class ApprovalPageService {
    private readonly http = inject(HttpClient);
    private url(kind: ApprovalKind, token: string) {
        return environment.apiuUrl + '/public/' + kind + '/' + encodeURIComponent(token);
    }
    load(kind: ApprovalKind, token: string) {
        return this.http.get<ApprovalPageData>(this.url(kind, token) + '/data', { withCredentials: true });
    }
    verify(kind: ApprovalKind, token: string, taxId: string) {
        return this.http.post<ApprovalPageData>(this.url(kind, token) + '/verify', { taxId }, { withCredentials: true });
    }
    upload(kind: ApprovalKind, token: string, file: File) {
        const body = new FormData();
        body.append('file', file);
        return this.http.post<void>(this.url(kind, token) + '/signed-upload', body, { withCredentials: true });
    }
    approve(kind: ApprovalKind, token: string) {
        return this.http.post<ApprovalPageData>(this.url(kind, token) + '/confirm', { confirmed: true }, { withCredentials: true });
    }
    download(kind: ApprovalKind, token: string, signed: boolean) {
        return this.http.get(this.url(kind, token) + (signed ? '/signed' : '/file'), { withCredentials: true, responseType: 'blob' });
    }
}
