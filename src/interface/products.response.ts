import type { Product } from "./products.interface";


export interface ProductsResponse {
  count: number;
  pages: number;
  products: Product[];
}



