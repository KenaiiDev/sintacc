import { redis, searchProducts } from '../lib/redis';

async function testRedis() {
  try {
    console.log('Testing Redis connection...');
    
    const allProductsStr = await redis.get('sintacc:v1:products:all');
    
    if (!allProductsStr) {
      console.log('❌ No products found in Redis!');
      console.log('Run "pnpm scrape" first to populate the database');
      return;
    }
    
    const allProducts = JSON.parse(allProductsStr as string);
    console.log(`✅ Found ${allProducts.length} products in Redis`);
    console.log('\nFirst product sample:');
    console.log(JSON.stringify(allProducts[0], null, 2));
    
    console.log('\n---\nTesting search for "arcor"...');
    const arcorResults = await searchProducts('arcor');
    console.log(`Found ${arcorResults.length} results for "arcor"`);
    if (arcorResults.length > 0) {
      console.log('First result:');
      console.log(JSON.stringify(arcorResults[0], null, 2));
    }
    
    console.log('\n---\nTesting search for RNPA "19-023655"...');
    const rnpaResults = await searchProducts('19-023655');
    console.log(`Found ${rnpaResults.length} results for RNPA`);
    if (rnpaResults.length > 0) {
      console.log('Result:');
      console.log(JSON.stringify(rnpaResults[0], null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testRedis();
