import { Component, OnInit, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CategoriesService } from '../../core/services/categories.service';
import { Category } from '../../shared/models/category.interface';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-categories-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categories.page.html',
  styleUrl: './categories.page.scss'
})
export class CategoriesPage implements OnInit {
  private svc = inject(CategoriesService);
  private router = inject(Router);

  categories: WritableSignal<Category[]> = signal<Category[]>([]);
  loading = false;
  error = '';

  ngOnInit(): void {
    this.error = '';
    this.loading = true;
    this.svc
      .list()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (list) => {
          this.error = '';
          this.categories.set(list ?? []);
        },
        error: (e) => {
          console.error('[Categories] load error', e);
          this.error = 'Errore nel caricamento delle categorie';
        }
      });
  }

  open(cat: Category) {
    // Navigate to listings filtered by category
    this.router.navigate(['/home'], { queryParams: { category: cat.slug } });
  }
}
