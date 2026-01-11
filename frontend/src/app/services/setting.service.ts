import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Setting {
  _id: string;
  key: string;
  value: any;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SettingService {
  private apiUrl = `${environment.apiUrl}/settings`;

  constructor(private http: HttpClient) {}

  getSettings(): Observable<Setting[]> {
    return this.http.get<Setting[]>(this.apiUrl);
  }

  getSetting(key: string): Observable<Setting> {
    return this.http.get<Setting>(`${this.apiUrl}/${key}`);
  }

  updateSetting(key: string, value: any): Observable<Setting> {
    return this.http.put<Setting>(`${this.apiUrl}/${key}`, { value });
  }
}
