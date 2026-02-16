'use client';

import { useState, useCallback } from 'react';
import SearchBox from '@/components/SearchBox';
import ResultDisplay from '@/components/ResultDisplay';
import type { SearchResult } from '@/lib/types';

export default function Home() {
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResult(null);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data: SearchResult = await response.json();
      setSearchResult(data);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResult({
        found: false,
        apto: false,
        products: [],
        message: 'Error al buscar. Por favor intenta nuevamente.',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Determine background state
  const getBackgroundState = () => {
    if (isLoading) return 'searching';
    if (!searchResult) return 'neutral';
    return searchResult.apto ? 'apto' : 'no-apto';
  };

  const backgroundState = getBackgroundState();

  return (
    <div className={`min-h-screen relative overflow-hidden transition-all duration-1000 ${
      backgroundState === 'apto' ? 'bg-emerald-50' :
      backgroundState === 'no-apto' ? 'bg-red-50' :
      'bg-sky-50'
    }`}>
      {/* Animated liquid blob background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="blob">
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
              <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9" result="blob" />
            </filter>
          </defs>
          
          {/* Main blob that expands from center */}
          <ellipse
            cx="50%"
            cy="20%"
            className={`transition-all duration-1000 ease-in-out ${
              backgroundState === 'apto' ? 'fill-emerald-200/40' :
              backgroundState === 'no-apto' ? 'fill-red-200/40' :
              'fill-sky-200/40'
            }`}
            filter="url(#blob)"
          >
            <animate
              attributeName="rx"
              values="200;250;220;240;200"
              dur="8s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="ry"
              values="180;200;240;190;180"
              dur="7s"
              repeatCount="indefinite"
            />
          </ellipse>

          {/* Secondary blob for organic effect */}
          <ellipse
            cx="50%"
            cy="20%"
            className={`transition-all duration-1000 ease-in-out ${
              backgroundState === 'apto' ? 'fill-emerald-300/30' :
              backgroundState === 'no-apto' ? 'fill-red-300/30' :
              'fill-sky-300/30'
            }`}
            filter="url(#blob)"
          >
            <animate
              attributeName="rx"
              values="300;320;280;310;300"
              dur="10s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="ry"
              values="250;280;260;270;250"
              dur="9s"
              repeatCount="indefinite"
            />
          </ellipse>

          {/* Third blob for depth */}
          <ellipse
            cx="50%"
            cy="20%"
            className={`transition-all duration-1000 ease-in-out ${
              backgroundState === 'apto' ? 'fill-emerald-100/50' :
              backgroundState === 'no-apto' ? 'fill-red-100/50' :
              'fill-sky-100/50'
            }`}
            filter="url(#blob)"
          >
            <animate
              attributeName="rx"
              values="400;380;420;390;400"
              dur="12s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="ry"
              values="350;370;340;360;350"
              dur="11s"
              repeatCount="indefinite"
            />
          </ellipse>
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <header className="pt-12 pb-8 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
              Verificador de Productos
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              Para Celíacos
            </p>
            <p className="text-sm text-gray-500 max-w-2xl mx-auto">
              Consulta el listado integrado de ANMAT para verificar si un producto es apto para personas celíacas
            </p>
          </div>
        </header>

        <main className="px-4 pb-16">
          <div className="max-w-4xl mx-auto">
            <SearchBox onSearch={handleSearch} isLoading={isLoading} />
            
            <ResultDisplay
              found={searchResult?.found || false}
              apto={searchResult?.apto || false}
              products={searchResult?.products || []}
              message={searchResult?.message}
              isSearching={isLoading}
            />
          </div>
        </main>

        <footer className="fixed bottom-0 left-0 right-0 py-4 bg-white/80 backdrop-blur-sm border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <p className="text-sm text-gray-600">
              Datos obtenidos de{' '}
              <a 
                href="https://listadoalg.anmat.gob.ar/Home" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`font-medium underline transition-colors ${
                  backgroundState === 'apto' ? 'text-emerald-600 hover:text-emerald-700' :
                  backgroundState === 'no-apto' ? 'text-red-600 hover:text-red-700' :
                  'text-sky-600 hover:text-sky-700'
                }`}
              >
                ANMAT - Listado Integrado ALG
              </a>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Verifica siempre el símbolo oficial en el producto
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Hecho por{' '}
              <a 
                href="https://lucasvillanueva.tech/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Lucas Villanueva
              </a>
              {' | '}
              <a 
                href="https://github.com/KenaiiDev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                GitHub
              </a>
              {' | '}
              <a 
                href="https://github.com/KenaiiDev/sintacc" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Source Code
              </a>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
