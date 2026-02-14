import { NextRequest, NextResponse } from 'next/server';
import { scrapeANMATData } from '@/lib/scraper';
import { storeProducts } from '@/lib/redis';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST(request: NextRequest) {
  try {
    console.log('Starting ANMAT data scraping...');
    
    const products = await scrapeANMATData();
    
    if (products.length === 0) {
      return NextResponse.json(
        { error: 'No products found during scraping' },
        { status: 500 }
      );
    }
    
    console.log('Storing products in Redis...');
    const count = await storeProducts(products);
    
    console.log(`Successfully stored ${count} products`);
    
    return NextResponse.json({
      success: true,
      message: `Successfully scraped and stored ${count} products`,
      count,
    });
    
  } catch (error) {
    console.error('Error in scrape API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to scrape ANMAT data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Use POST method to trigger scraping',
    endpoint: '/api/scrape',
    method: 'POST',
  });
}
