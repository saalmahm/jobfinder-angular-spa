export interface Application {
  id?: string | number;
  userId: string | number;
  offerId: string | number;
  apiSource?: string;
  title: string;
  company: string;
  location: string;
  url?: string;
  status: 'en_attente' | 'accepte' | 'refuse';
  notes?: string;
  dateAdded: string; 
}
