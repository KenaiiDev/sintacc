'use client';

import { useState, useEffect, useRef } from 'react';
import type { Product, SearchResult } from '@/lib/types';

type Phase = 'idle' | 'live' | 'settled';

const FETCH_LIVE_MS = 80;
const SETTLE_MS = 600;

async function fetchResults(query: string): Promise<SearchResult> {
  try {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    return await response.json();
  } catch {
    return {
      found: false,
      apto: false,
      products: [],
      message: 'Error al buscar. Por favor intenta nuevamente.',
    };
  }
}

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'gi');
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part)
      ? <span key={i} className="font-semibold" style={{ color: 'var(--text-primary)' }}>{part}</span>
      : <span key={i}>{part}</span>
  );
}

export default function Home() {
  const [query, setQuery] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [liveResults, setLiveResults] = useState<Product[]>([]);
  const [settledResult, setSettledResult] = useState<SearchResult | null>(null);
  const [isLiveLoading, setIsLiveLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const liveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const serialRef = useRef(0);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (query.trim().length < 2) {
      setPhase('idle');
      setLiveResults([]);
      setSettledResult(null);
      setIsLiveLoading(false);
      return;
    }

    setPhase('live');
    setIsLiveLoading(true);
    const serial = ++serialRef.current;

    if (liveTimer.current) clearTimeout(liveTimer.current);

    liveTimer.current = setTimeout(async () => {
      const result = await fetchResults(query);
      if (serial !== serialRef.current) return;
      setLiveResults(result.products);
      setIsLiveLoading(false);
    }, FETCH_LIVE_MS);

    return () => {
      if (liveTimer.current) clearTimeout(liveTimer.current);
    };
  }, [query]);

  useEffect(() => {
    if (query.trim().length < 2) {
      setSettledResult(null);
      return;
    }

    if (settleTimer.current) clearTimeout(settleTimer.current);
    const serial = ++serialRef.current;

    settleTimer.current = setTimeout(async () => {
      const result = await fetchResults(query);
      if (serial !== serialRef.current) return;
      setSettledResult(result);
      setLiveResults(result.products);
      setPhase('settled');
    }, SETTLE_MS);

    return () => {
      if (settleTimer.current) clearTimeout(settleTimer.current);
    };
  }, [query]);

  const clearSearch = () => {
    setQuery('');
    setPhase('idle');
    setLiveResults([]);
    setSettledResult(null);
    setIsLiveLoading(false);
    inputRef.current?.focus();
  };

  const hasQuery = query.trim().length >= 2;
  const hasAnyResults = liveResults.length > 0;
  const isQuerying = hasQuery && phase === 'live' && (isLiveLoading || !hasAnyResults);
  const showStatus = hasQuery && phase === 'settled' && settledResult;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <div className="flex flex-col min-h-screen">
        <header className="pt-10 pb-10 px-6" style={{ borderBottom: '1px solid var(--border)' }}>
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

        <main className="flex-1 px-6 pt-28 pb-14">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div
                className="absolute left-0 right-0 z-10"
                style={{
                  bottom: 'calc(100% + 20px)',
                  transition: 'opacity 0.25s ease-out, transform 0.25s ease-out',
                  opacity: showStatus ? 1 : 0,
                  transform: showStatus ? 'translateY(0)' : 'translateY(8px)',
                  pointerEvents: showStatus ? 'auto' : 'none',
                }}
              >
                {showStatus && settledResult && settledResult.found ? (
                  <div className="p-6 rounded-2xl" style={{
                    background: settledResult.apto ? 'var(--apto-surface)' : 'var(--caution-surface)',
                    border: `1px solid ${settledResult.apto ? 'var(--apto)' : 'var(--caution)'}`,
                  }}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                        style={{ background: settledResult.apto ? 'var(--apto)' : 'var(--caution)' }}>
                        {settledResult.apto ? (
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-xl font-bold" style={{ color: settledResult.apto ? 'var(--apto)' : 'var(--caution)', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                          {settledResult.apto ? 'Productos aptos para celíacos' : 'Verificá estos productos'}
                        </p>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)', fontFamily: "'DM Mono', monospace" }}>
                          {settledResult.message} · {settledResult.products.length} encontrados
                        </p>
                      </div>
                    </div>
                  </div>
                ) : showStatus && settledResult && !settledResult.found ? (
                  <div className="p-6 rounded-2xl" style={{ background: 'var(--no-apto-surface)', border: '1px solid var(--no-apto)' }}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--no-apto)' }}>
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xl font-bold" style={{ color: 'var(--no-apto)', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                          No se encontraron productos
                        </p>
                        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)', fontFamily: "'DM Mono', monospace" }}>
                          {settledResult.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>

              <div
                className="relative flex items-center gap-4 px-6 py-1 rounded-2xl transition-shadow duration-300"
                style={{
                  background: 'var(--surface-alt)',
                  border: '1px solid var(--border)',
                  boxShadow: hasQuery ? '0 2px 16px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                <svg className="w-5 h-5 shrink-0 transition-all duration-200"
                  style={{ color: hasQuery ? 'var(--text-primary)' : 'var(--text-muted)', opacity: hasQuery ? 1 : 0.5 }}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input ref={inputRef} type="text" value={query} onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscá por producto, marca o registro..."
                  className="flex-1 py-5 text-base bg-transparent focus:outline-none"
                  style={{ color: 'var(--text-primary)', caretColor: 'var(--text-primary)', fontFamily: "'DM Mono', monospace" }} />
                {isQuerying && (
                  <div className="shrink-0 w-4 h-4 rounded-full border-2 animate-spin-slow"
                    style={{ borderColor: 'var(--border)', borderTopColor: 'var(--text-secondary)' }} />
                )}
                {hasQuery && !isQuerying && (
                  <button onClick={clearSearch}
                    className="shrink-0 p-1.5 rounded-full transition-all duration-200 hover:scale-110"
                    style={{ color: 'var(--text-muted)' }} aria-label="Clear search">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div style={{ marginTop: '52px', position: 'relative', height: '360px' }}>
              <div style={{
                position: 'absolute', inset: 0,
                transition: 'opacity 0.2s',
                opacity: phase === 'idle' ? 1 : 0,
                pointerEvents: phase === 'idle' ? 'auto' : 'none',
              }}>
                <div className="text-center pt-8 pb-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ background: 'var(--surface)' }}>
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p className="text-base" style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}>
                    Empezá a escribir para buscar productos
                  </p>
                  <div className="flex flex-wrap justify-center gap-3 mt-6">
                    {['galletitas', 'arroz', 'leche', 'alfajor', 'pan'].map((suggestion) => (
                      <button key={suggestion} onClick={() => setQuery(suggestion)}
                        className="px-4 py-2 text-sm rounded-xl transition-all duration-200 hover:scale-105"
                        style={{ background: 'var(--surface)', color: 'var(--text-secondary)', border: '1px solid var(--border)', fontFamily: "'DM Mono', monospace" }}>
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{
                position: 'absolute', inset: 0,
                transition: 'opacity 0.2s',
                opacity: isQuerying ? 1 : 0,
                pointerEvents: isQuerying ? 'auto' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <div className="text-center">
                  <div className="w-7 h-7 rounded-full border-2 animate-spin-slow mx-auto"
                    style={{ borderColor: 'var(--border)', borderTopColor: 'var(--text-secondary)' }} />
                  <p className="text-sm mt-4" style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}>
                    Buscando &ldquo;{query}&rdquo; en el registro...
                  </p>
                </div>
              </div>

              <div style={{
                position: 'absolute', inset: 0,
                transition: 'opacity 0.25s',
                opacity: hasAnyResults ? 1 : 0,
                pointerEvents: hasAnyResults ? 'auto' : 'none',
                overflowY: 'auto',
              }}>
                {hasAnyResults && (
                  <>
                    <div className="pb-3 text-xs" style={{
                      transition: 'opacity 0.2s',
                      opacity: phase === 'live' ? 1 : 0,
                      pointerEvents: 'none',
                    }}>
                      <span style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}>
                        {liveResults.length} resultado{liveResults.length !== 1 ? 's' : ''} · seguí escribiendo para refinar
                      </span>
                    </div>
                    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                      {liveResults.map((product, i) => (
                        <div key={i}
                          className="px-6 py-5 flex items-center justify-between gap-4"
                          style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}>
                          <div className="min-w-0">
                            <p className="text-base" style={{ fontFamily: "'DM Mono', monospace" }}>
                              {highlightMatch(product.nombreFantasia, phase === 'settled' ? query : query)}
                            </p>
                            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)', fontFamily: "'DM Mono', monospace" }}>
                              {product.marca} · RNPA {product.rnpa}
                            </p>
                          </div>
                          <span className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg" style={{
                            background: product.estado === 'VIGENTE' ? 'var(--apto-surface)' : 'var(--no-apto-surface)',
                            color: product.estado === 'VIGENTE' ? 'var(--apto)' : 'var(--no-apto)',
                            fontFamily: "'DM Mono', monospace",
                          }}>
                            {product.estado === 'VIGENTE' ? 'APTO' : 'NO APTO'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
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
