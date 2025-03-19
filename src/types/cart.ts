// src/types/cart.ts

export interface Cart {
  quantity: number;
  product: {
    id: number;
    title: string;
    price: number;
    image: string;
    description: string;
  };
}
