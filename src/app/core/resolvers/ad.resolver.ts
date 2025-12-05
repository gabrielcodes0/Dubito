import { Injectable, inject } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdsService } from '../services/ads.service';
import { Ad } from '../../shared/models/ad.interface';

@Injectable({ providedIn: 'root' })
export class AdResolver implements Resolve<Ad | null> {
  private ads = inject(AdsService);

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Ad | null> {
    const idRaw = route.paramMap.get('id');
    const id = idRaw ? Number(idRaw) : NaN;
    if (!id || isNaN(id)) {
      return of(null);
    }
    return this.ads.get(id).pipe(
      catchError(err => {
        console.error('[AdResolver] errore fetching ad', err);
        return of(null);
      })
    );
  }
}

