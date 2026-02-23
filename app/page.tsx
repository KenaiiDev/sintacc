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

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <div className="flex flex-col min-h-screen">
        <header className="pt-8 pb-8 px-6" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="max-w-2xl mx-auto">
            <p
              className="text-xs font-medium tracking-widest uppercase mb-6"
              style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}
            >
              Argentina · ANMAT
            </p>
            <h1
              className="text-4xl md:text-5xl leading-tight mb-3"
              style={{ color: 'var(--text-primary)', fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700 }}
            >
              ¿Es apto para<br />
              <em style={{ fontFamily: "'Instrument Serif', serif", fontStyle: 'italic', fontWeight: 400 }}>
                celíacos?
              </em>
            </h1>
            <p
              className="text-sm mt-4"
              style={{ color: 'var(--text-secondary)', fontFamily: "'DM Mono', monospace" }}
            >
              Consultá el registro oficial de ANMAT antes de comprar
            </p>
          </div>
        </header>

        <main className="flex-1 px-6 py-12">
          <div className="max-w-2xl mx-auto">
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

        <footer className="px-6 py-8 mt-auto" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="max-w-2xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}>
              Datos de{' '}
              <a
                href="https://listadoalg.anmat.gob.ar/Home"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--text-secondary)' }}
                className="transition-colors hover:text-[color:var(--text-primary)] underline underline-offset-2"
              >
                ANMAT
              </a>
              {' '}· Verificá siempre el símbolo oficial en el envase
            </p>
            <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}>
              <a
                href="https://lucasvillanueva.tech/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--text-secondary)' }}
                className="transition-colors hover:text-[color:var(--text-primary)] underline underline-offset-2"
              >
                Lucas Villanueva
              </a>
              <a
                href="https://github.com/KenaiiDev/sintacc"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--text-secondary)' }}
                className="transition-colors hover:text-[color:var(--text-primary)] underline underline-offset-2"
              >
                GitHub
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
