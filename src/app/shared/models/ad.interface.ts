export interface Seller {
  nome: string;
  email: string;
  telefono: string;
}

export interface Ad {
  id: number;
  titolo: string;
  immagine_principale: string;
  galleria_immagini: string[];
  descrizione: string;
  categoria: string;
  prezzo: number;
  data_pubblicazione: string; // ISO date string
  citta: string;
  venditore: Seller;
}
