// types.ts
export interface Category {
  id: number;
  name: string;
  color: string;
}

export interface Place {
  id: number;
  nazwa: string;
  adres: string;
  kurzbeschreibung: string;
  latitude: number;
  longitude: number;
  categories: Category[];
}
