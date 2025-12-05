import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';

// Validator personalizzato per richiedere una struttura completa: qualcosa@dominio.tld (tld almeno 2 caratteri)
const completeEmailValidator = (): ValidatorFn => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/; // es. demo@d.it
  return (control: AbstractControl): ValidationErrors | null => {
    const v = control.value;
    if (v == null || v === '') return null; // leave required check to Validators.required
    return re.test(String(v)) ? null : { completeEmail: true };
  };
};

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss'
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  error = '';
  passwordError = ''; // messaggio specifico per la password quando manca

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.minLength(5), completeEmailValidator()]],
    password: ['', [Validators.required]]
  });

  // helper getter per il template
  get email() {
    return this.form.get('email');
  }

  get password() {
    return this.form.get('password');
  }

  // submit ora usa AuthService.login che interroga il json-server
  submit() {
    // reset specific password hint each attempt
    this.passwordError = '';

    // se il campo email non è valido, lasciamo che i messaggi del template gestiscano l'errore
    if (this.email?.invalid) {
      // segnaliamo i controlli come toccati così i messaggi compaiono
      this.email?.markAsTouched();
      this.password?.markAsTouched();
      return;
    }

    // se email valida ma password vuota o nulla -> mostra messaggio chiaro
    const pwdVal = this.password?.value;
    if (!pwdVal || String(pwdVal).trim() === '') {
      this.passwordError = 'Inserisci la password';
      this.password?.markAsTouched();
      return;
    }

    // usiamo il servizio per verificare le credenziali sul server
    this.error = '';
    const payload = { email: this.email?.value as string, password: this.password?.value as string };
    this.auth.login(payload).subscribe({
      next: (user) => {
        // manteniamo la sessionStorage come richiesto
        sessionStorage.setItem('user', JSON.stringify(user));
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Login failed', err);
        this.error = 'Credenziali errate!';
      }
    });
  }
}
