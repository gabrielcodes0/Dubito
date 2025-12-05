import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { Category } from '../../shared/models/category.interface';

const API = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private http = inject(HttpClient);

  // Cached observable to coalesce concurrent requests and survive quick route re-entries
  private cache$?: Observable<Category[]>;

  list(): Observable<Category[]> {
    if (!this.cache$) {
      const req$ = this.http.get<any>(`${API}/categories`).pipe(
        map((data: any): Category[] => this.normalizeCategories(data)),
        shareReplay(1)
      );
      // Keep one internal subscription so the HTTP call isn't canceled if the component
      // is destroyed and recreated quickly (e.g., double click on nav button)
      req$.subscribe({
        error: () => (this.cache$ = undefined)
      });
      this.cache$ = req$;
    }
    return this.cache$;
  }

  /** Normalize various backend shapes into a Category[] */
  private normalizeCategories(data: any): Category[] {
    if (Array.isArray(data)) return data as Category[];
    if (data && Array.isArray(data.items)) return data.items as Category[];
    if (data && Array.isArray(data.data)) return data.data as Category[];
    // If backend returns an object like {}, fallback to empty list instead of breaking the UI
    return [];
  }

  /** Optional: allow manual cache invalidation if needed in the future */
  invalidateCache(): void {
    this.cache$ = undefined;
  }
}
