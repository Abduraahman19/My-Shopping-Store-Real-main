export interface Product {
  description: string;
  id: number;
  image: string;
  price: number;
  rating?: {
    count?: number;
    rate?: number;
  };
  title: string;
}
