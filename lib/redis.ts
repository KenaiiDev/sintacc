import { Redis } from '@upstash/redis';
import type { Product } from './types';
import { REDIS_KEY_PREFIX } from './constants';

if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
  throw new Error('Missing Upstash Redis credentials. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env file');
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

async function clearAllProducts(): Promise<void> {
  const keys = await redis.keys(`${REDIS_KEY_PREFIX}product*`);
  
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}

export async function storeProducts(products: Product[]): Promise<number> {
  console.log('Clearing old products from Redis...');
  await clearAllProducts();
  
  console.log('Storing new products...');
  const pipeline = redis.pipeline();
  
  pipeline.set(`${REDIS_KEY_PREFIX}products:all`, JSON.stringify(products));
  
  for (const product of products) {
    if (product.rnpa) {
      pipeline.set(
        `${REDIS_KEY_PREFIX}product:rnpa:${product.rnpa.toLowerCase()}`,
        JSON.stringify(product)
      );
    }
    
    if (product.marca) {
      const marcaKey = `${REDIS_KEY_PREFIX}product:marca:${product.marca.toLowerCase()}`;
      pipeline.sadd(marcaKey, JSON.stringify(product));
    }
    
    if (product.nombreFantasia) {
      const nombreKey = `${REDIS_KEY_PREFIX}product:nombre:${product.nombreFantasia.toLowerCase()}`;
      pipeline.sadd(nombreKey, JSON.stringify(product));
    }
  }
  
  await pipeline.exec();
  return products.length;
}

export async function searchProducts(query: string): Promise<Product[]> {
  const normalizedQuery = normalizeText(query.trim());
  
  const rnpaMatch = await redis.get(`${REDIS_KEY_PREFIX}product:rnpa:${normalizedQuery}`);
  if (rnpaMatch) {
    return [rnpaMatch as Product];
  }
  
  const marcaMatches = await redis.smembers(`${REDIS_KEY_PREFIX}product:marca:${normalizedQuery}`);
  if (marcaMatches && marcaMatches.length > 0) {
    return (marcaMatches as unknown) as Product[];
  }
  
  const nombreMatches = await redis.smembers(`${REDIS_KEY_PREFIX}product:nombre:${normalizedQuery}`);
  if (nombreMatches && nombreMatches.length > 0) {
    return (nombreMatches as unknown) as Product[];
  }
  
  const allProductsStr = await redis.get(`${REDIS_KEY_PREFIX}products:all`);
  if (allProductsStr) {
    const allProducts: Product[] = allProductsStr as Product[];
    return allProducts.filter((p: Product) => 
      normalizeText(p.marca || '').includes(normalizedQuery) ||
      normalizeText(p.nombreFantasia || '').includes(normalizedQuery)
    );
  }
  
  return [];
}
