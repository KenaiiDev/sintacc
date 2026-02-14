import { scrapeANMATData } from '../lib/scraper';
import { storeProducts } from '../lib/redis';

async function main() {
  try {
    console.log('Starting ANMAT data scraping...');
    console.log(`Timestamp: ${new Date().toISOString()}`);
    
    const products = await scrapeANMATData();
    
    if (products.length === 0) {
      throw new Error('No products found during scraping');
    }
    
    console.log(`Successfully scraped ${products.length} products`);
    console.log('Storing products in Redis...');
    
    const count = await storeProducts(products);
    
    console.log(`Successfully stored ${count} products in Redis`);
    console.log('Scraping completed successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('Error during scraping:', error);
    process.exit(1);
  }
}

main();
