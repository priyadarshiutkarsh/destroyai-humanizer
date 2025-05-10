const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('DestroyAI backend is live!');
});

app.post('/humanize', async (req, res) => {
  const { essay } = req.body;

  if (!essay) {
    return res.status(400).json({ error: 'No essay provided' });
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto('https://ai-text-humanizer.com/', { waitUntil: 'networkidle2' });

    // Type the essay
    await page.waitForSelector('#textareaBefore');
    await page.type('#textareaBefore', essay);

    // Click the button with text 'Humanize Text'
    await page.evaluate(() => {
      const buttons = [...document.querySelectorAll('button')];
      const humanizeBtn = buttons.find(btn => btn.innerText.includes('Humanize Text'));
      if (humanizeBtn) humanizeBtn.click();
    });

    // Wait for the output area to populate (adjust if needed)
    await page.waitForSelector('textarea[readonly]', { timeout: 15000 });
    await page.waitForTimeout(4000); // Additional buffer time

    // Get the humanized result
    const result = await page.$eval('textarea[readonly]', el => el.value);

    await browser.close();
    res.json({ result });

  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: 'Failed to humanize text' });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`DestroyAI backend running on port ${PORT}`);
});
