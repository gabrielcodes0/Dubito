import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { Ad } from '../../models/ad.interface';

@Component({
  selector: 'app-ad-card',
  standalone: true,
  imports: [CurrencyPipe],
  templateUrl: './ad-card.component.html',
  styleUrls: ['./ad-card.component.scss']
})
export class AdCardComponent {
  @Input() ad!: Ad;
  @Output() favorite = new EventEmitter<Ad>();

  private router = inject(Router);

  openDetail() {
    this.router.navigate(['/home', this.ad.id]);
  }

  onFavoriteClick(event: Event) {
    event.stopPropagation(); // Impedisce che il click propaghi alla card
    this.favorite.emit(this.ad);
  }
}
