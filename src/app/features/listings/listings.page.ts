import { Component, HostListener, inject, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdsService } from '../../core/services/ads.service';
import { Ad } from '../../shared/models/ad.interface';
import { AdCardComponent } from '../../shared/components/ad-card/ad-card.component';
import { ActivatedRoute } from '@angular/router';
import { catchError, finalize, of, timeout } from 'rxjs';

// Map category slugs (from UI) to the actual field values used in backend/ads.json ('categoria')
const CATEGORY_SLUG_TO_NAME: Record<string, string> = {
  'elettronica': 'Elettronica',
  'sport': 'Sport',
  'casa-giardino': 'Casa e Giardino',
  'musica': 'Musica',
  'auto-moto': 'Auto e Moto',
  'abbigliamento': 'Abbigliamento',
  'immobili': 'Immobili'
};

@Component({
  selector: 'app-listings-page',
  standalone: true,
  imports: [FormsModule, AdCardComponent],
  templateUrl: './listings.page.html',
  styleUrl: './listings.page.scss'
})
export class ListingsPage {
  private adsService = inject(AdsService);
  private route = inject(ActivatedRoute);

  // State
  ads: WritableSignal<Ad[]> = signal<Ad[]>([]);
  loading = false;
  error = '';
  q = '';
  // Category filters: accept both slug (from /categories) and full name (json-server uses 'categoria' in Italian)
  categorySlug = '';
  categoria = '';
  // Nuovi filtri UI
  categoriaSelezionata = '';
  citta = '';
  ordina: 'data-desc' | 'data-asc' | 'prezzo-asc' | 'prezzo-desc' | 'titolo-asc' | 'titolo-desc' = 'data-desc';
  // Elenco dinamico delle città (estratto dal JSON)
  cities: string[] = [];

  // Pagination
  private page = 1;
  private readonly pageSize = 24; // adjust as needed
  private done = false;

  get canLoadMore() {
    return !this.done && !this.loading;
  }

  ngOnInit() {
    // carica l'elenco delle città disponibili dal backend
    this.loadCities();
    // react to query param changes (e.g., from Categories page)
    this.route.queryParamMap.subscribe((map) => {
      // Accept slug in query param 'category' (e.g., 'elettronica') and map it to the
      // actual field stored in backend/ads.json: 'categoria' with Italian names
      this.categorySlug = map.get('category') || '';
      this.categoria = CATEGORY_SLUG_TO_NAME[this.categorySlug] || '';
      // Se arriva una categoria da query param e l'utente non ha selezionato altro, rifletterla nella select
      if (!this.categoriaSelezionata && this.categoria) {
        this.categoriaSelezionata = this.categoria;
      }
      this.load(true);
    });
  }

  // Infinite scroll trigger (near bottom)
  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (this.loading || this.done) return;
    const threshold = 300; // px from bottom
    const pos = window.innerHeight + window.scrollY;
    const bottom = document.body.offsetHeight;
    if (bottom - pos < threshold) {
      this.load();
    }
  }

  onSearch() {
    this.load(true);
  }

  load(reset = false) {
    if (reset) {
      this.page = 1;
      this.done = false;
      this.ads.set([]);
      // also scroll to top on new search
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (this.loading || this.done) return;

    const params: any = { _page: this.page, _limit: this.pageSize };
    if (this.q) params.q = this.q;
    // Categoria effettiva: priorità alla select; '__consigliati__' non filtra la categoria
    const effectiveCategoria = this.categoriaSelezionata
      ? (this.categoriaSelezionata === '__consigliati__' ? '' : this.categoriaSelezionata)
      : this.categoria; // fallback da query param
    if (effectiveCategoria) params.categoria = effectiveCategoria;
    // Filtro città
    if (this.citta) params.citta = this.citta;
    // Ordinamento
    const mapSort: Record<string, { _sort: string; _order: 'asc' | 'desc' }> = {
      'data-desc': { _sort: 'data_pubblicazione', _order: 'desc' },
      'data-asc': { _sort: 'data_pubblicazione', _order: 'asc' },
      'prezzo-asc': { _sort: 'prezzo', _order: 'asc' },
      'prezzo-desc': { _sort: 'prezzo', _order: 'desc' },
      'titolo-asc': { _sort: 'titolo', _order: 'asc' },
      'titolo-desc': { _sort: 'titolo', _order: 'desc' }
    };
    const sortConf = mapSort[this.ordina] || mapSort['data-desc'];
    params._sort = sortConf._sort;
    params._order = sortConf._order;

    this.loading = true;
    this.error = '';
    this.adsService
      .list(params)
      .pipe(
        timeout(8000),
        catchError((err) => {
          console.error('[Listings] error loading ads', err);
          this.error = 'Errore nel caricamento degli annunci. Verifica che l\'API sia avviata e raggiungibile.';
          return of([] as Ad[]);
        }),
        finalize(() => (this.loading = false))
      )
      .subscribe((list) => {
        const current = this.ads();
        const next = [...current, ...list];
        this.ads.set(next);
        console.log('[Listings] page', this.page, 'received:', list?.length, 'total:', next.length);
        if (!list || list.length < this.pageSize) {
          this.done = true; // no more pages
        } else {
          this.page += 1;
        }
      });
  }

  private loadCities() {
    // Richiediamo un numero elevato di annunci per coprire tutte le città presenti
    const params: any = { _page: 1, _limit: 1000 };
    this.adsService
      .list(params)
      .pipe(
        timeout(8000),
        catchError((err) => {
          console.warn('[Listings] impossibile caricare le città', err);
          // In caso di errore lasciamo l'elenco vuoto (la select mostrerà solo "Tutte le città")
          return of([] as Ad[]);
        })
      )
      .subscribe((list) => {
        const set = new Set<string>();
        for (const ad of list || []) {
          const name = (ad.citta || '').trim();
          if (name) set.add(name);
        }
        this.cities = Array.from(set).sort((a, b) => a.localeCompare(b, 'it', { sensitivity: 'base' }));
      });
  }
}
