const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.send('DestroyAI backend is live!');
});

// Health check for the build process
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

app.post('/Humanize', async (req, res) => {
  const { essay } = req.body;
  
  if (!essay) {
    return res.status(400).json({ error: 'Essay content missing' });
  }

  try {
    console.log('Starting humanization process...');
    
    // Launch browser with additional Render-specific options
    const browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ],
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined
    });

    console.log('Browser launched, opening page...');
    
    const page = await browser.newPage();
    
    // Set timeout and user agent
    page.setDefaultTimeout(30000);
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    await page.goto('https://ai-text-humanizer.com/', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    console.log('Page loaded, looking for input field...');
    
    // Wait for and interact with the input field
    await page.waitForSelector('#textareaBefore', { timeout: 10000 });
    
    // Clear any existing text and type the essay
    await page.click('#textareaBefore');
    await page.keyboard.down('Control');
    await page.keyboard.press('a');
    await page.keyboard.up('Control');
    await page.type('#textareaBefore', essay);
    
    console.log('Text entered, clicking humanize button...');
    
    // Click the humanize button
    await page.click('button[type="submit"], button.btn-primary, button');
    
    console.log('Waiting for result...');
    
    // Wait for the result with a timeout
    await page.waitForSelector('#textareaAfter', { timeout: 20000 });
    
    // Wait a bit more for the text to be populated
    await page.waitForTimeout(3000);
    
    // Get the result
    const result = await page.$eval('#textareaAfter', el => el.value);
    
    await browser.close();
    
    console.log('Process completed successfully');
    res.json({ result });
    
  } catch (error) {
    console.error('Error during humanization:', error);
    res.status(500).json({ 
      error: 'Failed to humanize text',
      details: error.message 
    });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`DestroyAI backend running on port ${PORT}`);
});
