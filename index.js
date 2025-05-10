import express from 'express';
import puppeteer from 'puppeteer-core';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('DestroyAI backend is live!');
});

app.post('/Humanize', async (req, res) => {
  const { essay } = req.body;

  if (!essay) {
    return res.status(400).json({ error: 'Essay is missing' });
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: '/usr/bin/google-chrome',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto('https://ai-text-humanizer.com', { waitUntil: 'networkidle2' });

    await page.waitForSelector('#textareaBefore');
    await page.type('#textareaBefore', essay, { delay: 10 });
    await page.click('.aiHumanizer');

    await page.waitForSelector('#outputText', { timeout: 15000 });
    const result = await page.$eval('#outputText', el => el.textContent.trim());

    await browser.close();
    res.json({ result });

  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Processing failed' });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`DestroyAI backend running on port ${PORT}`);
});
