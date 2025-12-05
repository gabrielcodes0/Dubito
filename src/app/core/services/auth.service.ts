import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { LoginRequest, RegisterRequest, User } from '../../shared/models/auth.interface';

const API = 'http://localhost:3000';
const KEY = 'user'; // ora useriamo sessionStorage invece di localStorage

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient) {}

  get currentUser(): User | null {
    const raw = sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  }

  login(payload: LoginRequest): Observable<User> {
    return this.http
      .get<User[]>(`${API}/users`, { params: { email: payload.email, password: payload.password } })
      .pipe(
        map(users => {
          if (!users.length) throw new Error('Invalid credentials');
          sessionStorage.setItem(KEY, JSON.stringify(users[0]));
          return users[0];
        })
      );
  }

  register(payload: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${API}/users`, payload).pipe(
      tap(user => sessionStorage.setItem(KEY, JSON.stringify(user)))
    );
  }

  logout(): void {
    sessionStorage.removeItem(KEY);
  }
}
