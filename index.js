import express from 'express';
import puppeteer from 'puppeteer';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('DestroyAI backend is live!');
});

app.post('/Humanize', async (req, res) => {
  const { essay } = req.body;

  if (!essay || essay.trim() === '') {
    return res.status(400).json({ error: 'Essay text is required.' });
  }

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto('https://ai-text-humanizer.com/', { waitUntil: 'networkidle2' });

    // Type into textarea
    await page.waitForSelector('#textareaBefore');
    await page.type('#textareaBefore', essay, { delay: 20 });

    // Click Humanize button
    await page.click('.aiHumanizer');

    // Wait for output to appear
    await page.waitForSelector('#outputText', { timeout: 15000 });

    // Extract result
    const result = await page.$eval('#outputText', el => el.textContent.trim());

    await browser.close();
    res.json({ result });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to humanize text.' });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`DestroyAI backend running on port ${PORT}`);
});
