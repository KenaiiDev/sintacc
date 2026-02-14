import type { Product } from './types';
import { PRODUCT_STATUS } from './constants';

export function isProductApto(products: Product[]): boolean {
  return products.some(p => p.estado?.toUpperCase() === PRODUCT_STATUS.VIGENTE);
}

export function determineAptoStatus(products: Product[]): {
  apto: boolean;
  message: string;
} {
  if (products.length === 0) {
    return {
      apto: false,
      message: 'No se encontró el producto en el listado de ANMAT',
    };
  }

  const hasVigenteProduct = isProductApto(products);

  return {
    apto: hasVigenteProduct,
    message: hasVigenteProduct
      ? 'Producto apto para celíacos'
      : 'Producto encontrado pero no está vigente',
  };
}
