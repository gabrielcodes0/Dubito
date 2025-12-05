import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe, CommonModule } from '@angular/common';
import { AdsService } from '../../core/services/ads.service';
import { Ad } from '../../shared/models/ad.interface';
import { catchError, finalize, of, timeout } from 'rxjs';

@Component({
  selector: 'app-detail-page',
  standalone: true,
  imports: [CommonModule, CurrencyPipe],
  templateUrl: './detail.page.html',
  styleUrl: './detail.page.scss'
})
export class DetailPage {
  private route = inject(ActivatedRoute);
  private ads = inject(AdsService);
  private router = inject(Router);

  ad?: Ad;
  loading = true;
  error = '';

  ngOnInit() {
    // Recupero l'annuncio risolto dal resolver (assicurati che la route abbia `resolve: { ad: AdResolver }`)
    this.route.data.subscribe(d => {
      console.debug('[Detail] route data=', d);
      const resolvedAd = d['ad'] as Ad | null;
      if (resolvedAd) {
        this.ad = resolvedAd;
        this.error = '';
      } else {
        this.error = 'Annuncio non trovato o ID non valido';
      }
      this.loading = false;
    });
  }

  goBack() {
    this.router.navigate(['/home']);
  }
}
