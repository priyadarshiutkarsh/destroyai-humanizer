const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('DestroyAI backend is live!');
});

app.post('/Humanize', async (req, res) => {
  const { essay } = req.body;

  if (!essay) {
    return res.status(400).json({ error: 'Essay content missing' });
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto('https://ai-text-humanizer.com/', { waitUntil: 'networkidle2' });

    await page.waitForSelector('#textareaBefore');
    await page.type('#textareaBefore', essay);

    await page.click('button'); // Adjust this selector based on the site button

    await page.waitForTimeout(8000);
    const result = await page.$eval('#textareaAfter', el => el.value);

    await browser.close();
    res.json({ result });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to humanize text' });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`DestroyAI backend running on port ${PORT}`);
});
