export interface Product {
  tipoProducto: string;
  marca: string;
  nombreFantasia: string;
  denominacionVenta: string;
  rnpa: string;
  estado: string;
}

export interface SearchResult {
  found: boolean;
  apto: boolean;
  products: Product[];
  message?: string;
}
