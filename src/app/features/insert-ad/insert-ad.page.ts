import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AdsService } from '../../core/services/ads.service';

@Component({
  selector: 'app-insert-ad',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './insert-ad.page.html',
  styleUrl: './insert-ad.page.scss'
})
export class InsertAdPage {
  private fb = inject(FormBuilder);
  private ads = inject(AdsService);

  form = this.fb.nonNullable.group({
    // aggiunto pattern per evitare numeri/simboli nel titolo: solo lettere e spazi
    titolo: ['', [Validators.required, Validators.minLength(5), Validators.pattern('^[A-Za-zÀ-ÖØ-öø-ÿ ]+$')]],
    immagine_principale: ['', [Validators.required]],
    descrizione: ['', [Validators.required, Validators.minLength(10)]],
    categoria: ['', Validators.required],
    prezzo: [0, [Validators.required, Validators.min(0)]],
    // aggiunto minlength e pattern per citta
    citta: ['', [Validators.required, Validators.minLength(2), Validators.pattern('^[A-Za-zÀ-ÖØ-öø-ÿ ]+$')]]
  });

  success = false;
  loading = false;
  submitted = false;

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    const ctrl = this.form.get('immagine_principale');
    if (!ctrl) return;

    if (!file) {
      ctrl.reset('');
      ctrl.markAsTouched();
      ctrl.updateValueAndValidity();
      this.loading = false;
      return;
    }

    this.loading = true;
    const validExt = ['image/png', 'image/jpeg'];
    if (!validExt.includes(file.type)) {
      // set a validation error if the file type is not allowed
      ctrl.setErrors({ invalidType: true });
      this.loading = false;
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      ctrl.setValue(dataUrl);
      ctrl.markAsDirty();
      ctrl.updateValueAndValidity();
      // Non azzeriamo loading qui per mantenere "caricamento..." finché non arriva success
    };
    reader.readAsDataURL(file);
  }

  submit() {
    this.submitted = true;
    if (this.form.invalid) {
      console.log('InsertAd submit - form invalid', this.form.errors, this.form.value, this.form.getRawValue());
      // opzionale: scroll al primo campo non valido
      const firstInvalid = Object.keys(this.form.controls).find(k => this.form.get(k)?.invalid);
      if (firstInvalid) {
        const el = document.getElementById(firstInvalid);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    const body = { ...this.form.getRawValue(), galleria_immagini: [] };
    this.success = false;
    this.loading = true;
    this.ads.create(body).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
        alert('Annuncio pubblicato con successo');
        // opzionale: reset del form dopo il salvataggio
        this.form.reset();
        this.submitted = false;
      },
      error: () => {
        this.success = false;
        this.loading = false;
      }
    });
  }
}
