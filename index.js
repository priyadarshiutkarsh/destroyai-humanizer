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

  if (!essay) {
    return res.status(400).json({ error: 'No essay provided' });
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto('https://notegpt.io/ai-humanizer', { waitUntil: 'networkidle2' });

    // Paste the essay text
    await page.waitForSelector('textarea.el-textarea__inner');
    await page.type('textarea.el-textarea__inner', essay);

    // Click the Humanize button
    await page.click('button:has-text("AI Humanizer")');

    // Wait for the result to appear
    await page.waitForSelector('.output-paragraph'); // Adjust this selector if needed
    await page.waitForTimeout(7000); // Give it time to process

    // Get result
    const result = await page.$eval('.output-paragraph', el => el.textContent);

    await browser.close();
    res.json({ result });

  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong');
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`DestroyAI backend running on port ${PORT}`);
});
