export interface FavoriteOffer {
  id?: string | number;
  userId: string | number;
  offerId: string | number;
  title: string;
  company: string;
  location: string;
  date: string;
  sourceUrl?: string;
}
