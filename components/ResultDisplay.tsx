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

function SearchingState() {
  return (
    <div className="mt-6" style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}>
      <p className="text-xs tracking-widest uppercase">Buscando en el registro...</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-6" style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}>
      <p className="text-xs tracking-widest uppercase">Ingresá el nombre de un producto para verificarlo</p>
    </div>
  );
}

function StatusLabel({ label, color }: { label: string; color: string }) {
  return (
    <p
      className="text-xs font-medium tracking-widest uppercase mb-4"
      style={{ color, fontFamily: "'DM Mono', monospace" }}
    >
      {label}
    </p>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <div
      className="py-3 px-4"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      <p className="text-sm leading-snug" style={{ color: 'var(--text-primary)', fontFamily: "'DM Mono', monospace" }}>
        {product.nombreFantasia}
      </p>
      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
        <span className="text-xs" style={{ color: 'var(--text-secondary)', fontFamily: "'DM Mono', monospace" }}>
          {product.marca}
        </span>
        <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}>
          Reg. {product.rnpa}
        </span>
        <span className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}>
          {product.estado}
        </span>
      </div>
    </div>
  );
}

function ProductList({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  const displayed = products.slice(0, MAX_DISPLAYED_PRODUCTS);
  const remaining = products.length - MAX_DISPLAYED_PRODUCTS;

  return (
    <div
      className="mt-6 rounded-lg overflow-hidden"
      style={{ border: '1px solid var(--border)', background: 'var(--surface-alt)' }}
    >
      <div className="px-4 py-3" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}>
          {products.length === 1 ? '1 producto encontrado' : `${products.length} productos encontrados`}
        </p>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {displayed.map((product, index) => (
          <ProductCard key={index} product={product} />
        ))}
        {remaining > 0 && (
          <div className="py-3 px-4" style={{ borderTop: '1px solid var(--border)' }}>
            <p className="text-xs" style={{ color: 'var(--text-muted)', fontFamily: "'DM Mono', monospace" }}>
              Y {remaining} productos más en el registro
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function AptoResult({ products, message }: { products: Product[]; message?: string }) {
  return (
    <div className="mt-6 animate-fade-up">
      <h2
        className="text-5xl md:text-6xl leading-none mb-3"
        style={{ color: 'var(--apto)', fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700 }}
      >
        APTO
      </h2>
      <p className="text-sm" style={{ color: 'var(--text-secondary)', fontFamily: "'DM Mono', monospace" }}>
        {message || 'Este producto está habilitado para personas celíacas'}
      </p>
      <ProductList products={products} />
    </div>
  );
}

function NoAptoResult({ message }: { message?: string }) {
  return (
    <div className="mt-6 animate-fade-up">
      <h2
        className="text-5xl md:text-6xl leading-none mb-3"
        style={{ color: 'var(--no-apto)', fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700 }}
      >
        NO APTO
      </h2>
      <p className="text-sm" style={{ color: 'var(--text-secondary)', fontFamily: "'DM Mono', monospace" }}>
        {message || 'No se encontró este producto en el registro de ANMAT'}
      </p>
    </div>
  );
}

function CautionResult({ message }: { message?: string }) {
  return (
    <div className="mt-6 animate-fade-up">
      <h2
        className="text-5xl md:text-6xl leading-none mb-3"
        style={{ color: 'var(--caution)', fontFamily: "'Bricolage Grotesque', sans-serif", fontWeight: 700 }}
      >
        PRECAUCIÓN
      </h2>
      <p className="text-sm" style={{ color: 'var(--text-secondary)', fontFamily: "'DM Mono', monospace" }}>
        {message || 'El producto fue encontrado pero su habilitación no está vigente'}
      </p>
    </div>
  );
}

export default function ResultDisplay({
  found,
  apto,
  products,
  message,
  isSearching,
}: ResultDisplayProps) {
  if (isSearching) return <SearchingState />;
  if (!found && !message) return <EmptyState />;
  if (!found) return <NoAptoResult message={message} />;
  if (apto) return <AptoResult products={products} message={message} />;
  return <CautionResult message={message} />;
}
