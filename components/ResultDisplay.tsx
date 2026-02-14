'use client';

import { Product } from '@/lib/types';
import { MAX_DISPLAYED_PRODUCTS } from '@/lib/constants';

interface ResultDisplayProps {
  found: boolean;
  apto: boolean;
  products: Product[];
  message?: string;
  isSearching: boolean;
}

export default function ResultDisplay({ 
  found, 
  apto, 
  products, 
  message,
  isSearching 
}: ResultDisplayProps) {
  
  if (isSearching) {
    return (
      <div className="mt-12 text-center animate-pulse-soft">
        <p className="text-xl text-gray-500">Buscando...</p>
      </div>
    );
  }

  if (!found && !message) {
    return (
      <div className="mt-12 text-center">
        <div className="inline-block p-8 rounded-3xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-lg text-gray-600">Comienza buscando un producto</p>
        </div>
      </div>
    );
  }

  if (!found) {
    return (
      <div className="mt-12 animate-fade-in">
        <div className="max-w-3xl mx-auto p-8 rounded-3xl bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 shadow-lg">
          <div className="text-center">
            <div className="inline-block p-4 rounded-full bg-red-200 mb-4">
              <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-5xl font-bold text-red-700 mb-4">NO APTO</h2>
            <p className="text-xl text-red-600">{message || 'Producto no encontrado en el listado de ANMAT'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (apto) {
    return (
      <div className="mt-12 animate-fade-in">
        <div className="max-w-3xl mx-auto p-8 rounded-3xl bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 shadow-lg">
          <div className="text-center">
            <div className="inline-block p-4 rounded-full bg-emerald-200 mb-4">
              <svg className="w-12 h-12 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-5xl font-bold text-emerald-700 mb-4">APTO</h2>
            <p className="text-xl text-emerald-600 mb-6">{message || 'Producto apto para celíacos'}</p>
            
            {products.length > 0 && (
              <div className="mt-6 text-left bg-white/50 rounded-2xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-emerald-800 mb-4">
                  {products.length === 1 ? 'Producto encontrado:' : `${products.length} productos encontrados:`}
                </h3>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {products.slice(0, MAX_DISPLAYED_PRODUCTS).map((product, index) => (
                    <div key={index} className="p-4 bg-white rounded-xl border border-emerald-100 shadow-sm">
                      <p className="font-semibold text-emerald-900">{product.nombreFantasia}</p>
                      <p className="text-sm text-gray-600 mt-1">Marca: {product.marca}</p>
                      <p className="text-sm text-gray-600">RNPA: {product.rnpa}</p>
                      <p className="text-xs text-emerald-600 mt-2 font-medium">Estado: {product.estado}</p>
                    </div>
                  ))}
                  {products.length > MAX_DISPLAYED_PRODUCTS && (
                    <p className="text-sm text-gray-500 text-center pt-2">
                      Y {products.length - MAX_DISPLAYED_PRODUCTS} productos más...
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-12 animate-fade-in">
      <div className="max-w-3xl mx-auto p-8 rounded-3xl bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-amber-200 shadow-lg">
        <div className="text-center">
          <div className="inline-block p-4 rounded-full bg-amber-200 mb-4">
            <svg className="w-12 h-12 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-5xl font-bold text-amber-700 mb-4">PRECAUCIÓN</h2>
          <p className="text-xl text-amber-600">{message || 'Producto encontrado pero no está vigente'}</p>
        </div>
      </div>
    </div>
  );
}
