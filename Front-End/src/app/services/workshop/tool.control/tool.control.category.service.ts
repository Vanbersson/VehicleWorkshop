import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { StorageService } from '../../storage/storage.service';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { ToolControlCategory } from '@/app/models/workshop/tool.control/tool.control.category';

@Injectable({
  providedIn: 'root'
})
export class ToolControlCategoryService {
  private storage = inject(StorageService);
  private http = inject(HttpClient);

  private companyResale: string = this.storage.companyId + "/" + this.storage.resaleId;

  saveCat(cat: ToolControlCategory): Observable<HttpResponse<ToolControlCategory>> {
    return this.http.post<ToolControlCategory>(environment.apiuUrl + "/workshop/tool/control/category/save", cat, { headers: this.myHeaders(), observe: 'response' });
  }
  updateCat(cat: ToolControlCategory): Observable<HttpResponse<ToolControlCategory>> {
    return this.http.post<ToolControlCategory>(environment.apiuUrl + "/workshop/tool/control/category/update", cat, { headers: this.myHeaders(), observe: 'response' });
  }
  listAll(): Observable<ToolControlCategory[]> {
    return this.http.get<ToolControlCategory[]>(environment.apiuUrl + "/workshop/tool/control/category/" + this.companyResale + "/all", { headers: this.myHeaders() });
  }
  listAllEnabled(): Observable<ToolControlCategory[]> {
    return this.http.get<ToolControlCategory[]>(environment.apiuUrl + "/workshop/tool/control/category/" + this.companyResale + "/all/enabled", { headers: this.myHeaders() });
  }

  private myHeaders(): HttpHeaders {
    const httpOptions = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.storage.token,
    });
    return httpOptions;
  }
} 