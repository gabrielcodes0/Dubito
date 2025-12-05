import { Routes } from '@angular/router';
import { ListingsPage } from './features/listings/listings.page';
import { DetailPage } from './features/detail/detail.page';
import { InsertAdPage } from './features/insert-ad/insert-ad.page';
import { LoginPage } from './features/login/login.page';
import { RegisterPage } from './features/register/register.page';
import { ContactsPage } from './features/contacts/contacts.page';

import { CategoriesPage } from './features/categories/categories.page';
import { AdResolver } from './core/resolvers/ad.resolver';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  // Legacy redirects from old 'ads' paths
  { path: 'ads', redirectTo: 'home', pathMatch: 'full' },
  { path: 'ads/:id', redirectTo: 'home/:id' },
  // New home routes
  { path: 'home', component: ListingsPage },
  { path: 'home/:id', component: DetailPage, resolve: { ad: AdResolver } },
  { path: 'categories', component: CategoriesPage },
  { path: 'insert', component: InsertAdPage },
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegisterPage },
  { path: 'contacts', component: ContactsPage },
  { path: '**', redirectTo: 'home' }
];
