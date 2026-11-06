import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ApprovalPageService } from './approval.page.service';
import { environment } from '@/environments/environment';

describe('Public approval API', () => {
    let service: ApprovalPageService;
    let http: HttpTestingController;
    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
        service = TestBed.inject(ApprovalPageService);
        http = TestBed.inject(HttpTestingController);
    });
    afterEach(() => http.verify());
    for (const kind of ['proposals', 'orders'] as const) {
        it('uses the client session for ' + kind + ' identification and approval', () => {
            const base = environment.apiuUrl + '/public/' + kind + '/token';
            service.load(kind, 'token').subscribe();
            const load = http.expectOne(base + '/data');
            expect(load.request.withCredentials).toBeTrue();
            expect(load.request.headers.has('Authorization')).toBeFalse();
            load.flush({ accessRequired: true });
            service.verify(kind, 'token', '123.456.789-01').subscribe();
            const verify = http.expectOne(base + '/verify');
            expect(verify.request.withCredentials).toBeTrue();
            expect(verify.request.body).toEqual({ taxId: '123.456.789-01' });
            verify.flush({ accessRequired: false });
            service.approve(kind, 'token').subscribe();
            const approve = http.expectOne(base + '/confirm');
            expect(approve.request.withCredentials).toBeTrue();
            expect(approve.request.body).toEqual({ confirmed: true });
            approve.flush({ approvedAt: '2026-11-05T12:00:00Z' });
        });
    }
    it('uploads multipart data and downloads original and signed files with the client session', () => {
        const base = environment.apiuUrl + '/public/orders/token';
        const file = new File(['%PDF-test'], 'signed.pdf', { type: 'application/pdf' });
        service.upload('orders', 'token', file).subscribe();
        const upload = http.expectOne(base + '/signed-upload');
        expect(upload.request.body.get('file')).toBe(file);
        expect(upload.request.withCredentials).toBeTrue();
        expect(upload.request.headers.has('Content-Type')).toBeFalse();
        upload.flush(null);
        for (const signed of [false, true]) {
            service.download('orders', 'token', signed).subscribe();
            const download = http.expectOne(base + (signed ? '/signed' : '/file'));
            expect(download.request.withCredentials).toBeTrue();
            expect(download.request.responseType).toBe('blob');
            download.flush(new Blob(['pdf']));
        }
    });
});
