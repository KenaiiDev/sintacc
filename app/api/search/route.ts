import { NextRequest, NextResponse } from 'next/server';
import { searchProducts } from '@/lib/redis';
import { determineAptoStatus } from '@/lib/product-validator';
import type { SearchResult } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    
    if (!query || query.trim() === '') {
      return NextResponse.json<SearchResult>({
        found: false,
        apto: false,
        products: [],
        message: 'Por favor ingresa un término de búsqueda',
      });
    }
    
    const products = await searchProducts(query);
    
    if (products.length === 0) {
      return NextResponse.json<SearchResult>({
        found: false,
        apto: false,
        products: [],
        message: 'No se encontró el producto en el listado de ANMAT',
      });
    }
    
    const { apto, message } = determineAptoStatus(products);
    
    return NextResponse.json<SearchResult>({
      found: true,
      apto,
      products,
      message,
    });
    
  } catch (error) {
    console.error('Error in search API:', error);
    return NextResponse.json<SearchResult>(
      { 
        found: false,
        apto: false,
        products: [],
        message: 'Error al buscar el producto',
      },
      { status: 500 }
    );
  }
}
