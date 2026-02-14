import puppeteer, { Browser, Page } from 'puppeteer';
import type { Product } from './types';
import {
  ANMAT_URL,
  ANMAT_SELECTORS,
  MAX_SCRAPE_PAGES,
  SCRAPE_TIMEOUT_MS,
  NAVIGATION_TIMEOUT_MS,
  SELECTOR_TIMEOUT_MS,
} from './constants';

async function launchBrowser(): Promise<Browser> {
  return await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
}

async function navigateToANMAT(page: Page): Promise<void> {
  await page.goto(ANMAT_URL, {
    waitUntil: 'networkidle0',
    timeout: SCRAPE_TIMEOUT_MS,
  });

  await page.waitForSelector(ANMAT_SELECTORS.searchButton, {
    timeout: SELECTOR_TIMEOUT_MS,
  });
}

async function initiateSearch(page: Page): Promise<void> {
  await page.select('#ctl00_ContentPlaceHolder1_ddEstado', 'VIGENTE');
  await new Promise(resolve => setTimeout(resolve, 500));
  
  await page.click(ANMAT_SELECTORS.searchButton);
  await page.waitForSelector(ANMAT_SELECTORS.resultsTable, {
    timeout: NAVIGATION_TIMEOUT_MS,
  });
  await new Promise(resolve => setTimeout(resolve, 2000));
}

function extractProductsFromPage(page: Page): Promise<Product[]> {
  return page.evaluate(() => {
    const rows = document.querySelectorAll('#ctl00_ContentPlaceHolder1_GridView1 tr');
    const data: Product[] = [];

    for (let i = 1; i < rows.length; i++) {
      const cells = rows[i].querySelectorAll('td');
      if (cells.length >= 6) {
        const firstCellText = cells[0]?.textContent?.trim() || '';
        
        if (firstCellText && !firstCellText.match(/^\d+$/) && firstCellText !== '...') {
          data.push({
            tipoProducto: cells[0]?.textContent?.trim() || '',
            marca: cells[1]?.textContent?.trim() || '',
            nombreFantasia: cells[2]?.textContent?.trim() || '',
            denominacionVenta: cells[3]?.textContent?.trim() || '',
            rnpa: cells[4]?.textContent?.trim() || '',
            estado: cells[5]?.textContent?.trim() || '',
          });
        }
      }
    }

    return data;
  });
}

async function navigateToNextPage(page: Page, currentPage: number): Promise<boolean> {
  const nextPage = currentPage + 1;
  
  const navigationResult = await page.evaluate((pageNum) => {
    const links = Array.from(document.querySelectorAll('#ctl00_ContentPlaceHolder1_GridView1 tr:last-child a'));
    
    const nextPageLink = links.find(link => {
      const text = link.textContent?.trim();
      return text === pageNum.toString();
    });
    
    if (nextPageLink) {
      (nextPageLink as HTMLAnchorElement).click();
      return { clicked: true, type: 'direct' };
    }
    
    const ellipsisLink = links.find(link => {
      const text = link.textContent?.trim();
      return text === '...';
    });
    
    if (ellipsisLink) {
      (ellipsisLink as HTMLAnchorElement).click();
      return { clicked: true, type: 'ellipsis' };
    }
    
    return { clicked: false, type: 'none' };
  }, nextPage);

  if (navigationResult.clicked) {
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    if (navigationResult.type === 'ellipsis') {
      const retryClicked = await page.evaluate((pageNum) => {
        const links = Array.from(document.querySelectorAll('#ctl00_ContentPlaceHolder1_GridView1 tr:last-child a'));
        const nextPageLink = links.find(link => {
          const text = link.textContent?.trim();
          return text === pageNum.toString();
        });
        
        if (nextPageLink) {
          (nextPageLink as HTMLAnchorElement).click();
          return true;
        }
        return false;
      }, nextPage);
      
      if (retryClicked) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    return true;
  }

  return false;
}

export async function scrapeANMATData(): Promise<Product[]> {
  const products: Product[] = [];
  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();
    
    await navigateToANMAT(page);
    await initiateSearch(page);

    let hasMorePages = true;
    let pageCount = 0;

    while (hasMorePages && pageCount < MAX_SCRAPE_PAGES) {
      pageCount++;
      console.log(`Scraping page ${pageCount}...`);

      const pageProducts = await extractProductsFromPage(page);
      products.push(...pageProducts);
      
      console.log(`Found ${pageProducts.length} products on page ${pageCount} (Total: ${products.length})`);

      if (pageProducts.length === 0) {
        console.log('No more products found, stopping...');
        break;
      }

      hasMorePages = await navigateToNextPage(page, pageCount);
      
      if (!hasMorePages) {
        console.log('No more pages available');
      }
    }

    console.log(`Scraping complete! Total products: ${products.length}`);
    
  } catch (error) {
    console.error('Error during scraping:', error);
    throw error;
  } finally {
    await browser.close();
  }

  return products;
}
