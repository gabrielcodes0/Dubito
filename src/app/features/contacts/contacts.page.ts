import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';

@Component({
  selector: 'app-contacts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contacts.page.html',
  styleUrls: ['./contacts.page.scss']
})
export class ContactsPage {
  submitted = false;

  onSubmit(form: NgForm) {
    console.log('onSubmit called', form.value, 'valid:', form.valid);
    this.submitted = true;
    if (form.valid) {
      // mostra alert di successo
      alert('Richiesta inviata con successo');
      form.resetForm();
      this.submitted = false; // consentiamo nuovo invio senza errori mostrati
    }
  }
}
