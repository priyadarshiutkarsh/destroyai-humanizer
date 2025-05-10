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
  console.log('Received essay:', essay);

  try {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto('https://ai-text-humanizer.com', { waitUntil: 'networkidle2' });

    // Type essay into textarea
    await page.waitForSelector('#textareaBefore');
    await page.type('#textareaBefore', essay);

    // Click humanize button
    await page.click('button:has-text("Humanize Text")');

    // Wait for output
    await page.waitForSelector('#textareaAfter', { timeout: 15000 });

    // Get result
    const result = await page.$eval('#textareaAfter', el => el.value);

    await browser.close();
    res.json({ result });
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`DestroyAI backend running on port ${PORT}`);
});
