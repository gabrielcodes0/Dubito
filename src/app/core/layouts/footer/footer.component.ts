import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  year = new Date().getFullYear();
  email = '';

  subscribe(ev: Event) {
    ev.preventDefault();
    // Solo demo: non invia davvero, ma puoi collegarlo a un servizio in futuro
    console.log('Newsletter subscribe:', this.email);
    this.email = '';
  }
}
