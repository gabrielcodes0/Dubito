import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private key = 'favorites_ids';

  list(): number[] {
    try { return JSON.parse(localStorage.getItem(this.key) || '[]'); } catch { return []; }
  }
  has(id: number): boolean { return this.list().includes(id); }
  toggle(id: number): void {
    const set = new Set(this.list());
    set.has(id) ? set.delete(id) : set.add(id);
    localStorage.setItem(this.key, JSON.stringify(Array.from(set)));
  }
}
