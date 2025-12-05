import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ad } from '../../shared/models/ad.interface';

const API = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class AdsService {
  private http = inject(HttpClient);

  list(params?: { q?: string; category?: string; city?: string; _page?: number; _limit?: number; }): Observable<Ad[]> {
    let p = new HttpParams();
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined && v !== null && v !== '') p = p.set(k, String(v));
      }
    }
    return this.http.get<Ad[]>(`${API}/ads`, { params: p });
  }

  get(id: number): Observable<Ad> {
    return this.http.get<Ad>(`${API}/ads/${id}`);
  }

  create(body: Partial<Ad>): Observable<Ad> {
    return this.http.post<Ad>(`${API}/ads`, body);
  }
}
