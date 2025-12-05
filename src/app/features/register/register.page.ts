import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

// stesso validator completo usato in login
const completeEmailValidator = (): ValidatorFn => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return (control: AbstractControl): ValidationErrors | null => {
    const v = control.value;
    if (v == null || v === '') return null;
    return re.test(String(v)) ? null : { completeEmail: true };
  };
};

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.page.html',
  styleUrl: './register.page.scss'
})
export class RegisterPage {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, completeEmailValidator()]],
    password: [''] // nessun vincolo lato client
  });

  get name() { return this.form.get('name'); }
  get email() { return this.form.get('email'); }
  get password() { return this.form.get('password'); }

  submit() {
    // segnaliamo i campi toccati così i messaggi compaiono
    this.name?.markAsTouched();
    this.email?.markAsTouched();

    // se l'email non è valida mostriamo errori inline e blocchiamo la registrazione
    if (this.email?.invalid) return;

    // costruiamo il payload e usiamo il servizio per registrare sul json-server
    const val = this.form.getRawValue();
    const payload = { name: val.name, email: val.email, password: val.password };

    this.auth.register(payload).subscribe({
      next: (user) => {
        // mettiamo in sessionStorage come fatto per login
        sessionStorage.setItem('user', JSON.stringify(user));
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Register failed', err);
        // fallback locale nel caso il server non sia disponibile: salviamo in localStorage
        const raw = localStorage.getItem('users');
        const users = raw ? (JSON.parse(raw) as any[]) : [];
        const newId = users.length ? Math.max(...users.map(u => u.id || 0)) + 1 : 1;
        const user = { id: newId, name: val.name, email: val.email, password: val.password };
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
        sessionStorage.setItem('user', JSON.stringify(user));
        // Non usiamo più localStorage per l'utente autenticato; stiamo usando sessionStorage

        this.router.navigate(['/home']);
      }
    });
  }
}
