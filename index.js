
const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/humanize', async (req, res) => {
  const { essay } = req.body;

  console.log('📝 Received essay:', essay);

  if (!essay) {
    return res.status(400).json({ error: 'No essay provided' });
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();

    await page.goto('https://ai-text-humanizer.com', { waitUntil: 'networkidle2' });

    await page.waitForSelector('#input-text');
    await page.type('#input-text', essay);

    await page.click('#submit-button');

    await page.waitForSelector('#output-text', { timeout: 15000 });
    await page.waitForTimeout(7000); // wait for text to process

    const result = await page.$eval('#output-text', el => el.value);

    console.log('✅ Humanized result:', result);

    await browser.close();

    res.json({ result });
  } catch (e) {
    console.error('❌ Error during humanization:', e);
    res.status(500).json({ error: 'Something went wrong during processing.' });
  }
});

app.get('/', (req, res) => {
  res.send('DestroyAI backend is live!');
});

app.listen(PORT, () => {
  console.log(`🚀 DestroyAI backend running on port ${PORT}`);
});
