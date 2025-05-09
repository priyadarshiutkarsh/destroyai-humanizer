
const express = require('express');
const puppeteer = require('puppeteer');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/humanize', async (req, res) => {
  const { essay } = req.body;

  console.log('📝 Received essay:', essay);

  if (!essay) {
    return res.status(400).send('No essay provided');
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
    await page.waitForTimeout(7000); // wait for processing

    const result = await page.$eval('#output-text', el => el.value);

    console.log('✅ Humanized result:', result);

    await browser.close();

    res.send(`
      <html>
        <head><title>Humanized Essay</title></head>
        <body style="font-family:sans-serif; padding: 2rem;">
          <h2>✅ Your Essay Has Been Humanized</h2>
          <p><strong>Original Text:</strong></p>
          <pre>${essay}</pre>
          <p><strong>Humanized Output:</strong></p>
          <pre>${result}</pre>
          <br />
          <a href="https://form.jotform.com/251283670727057">⬅ Submit Another</a>
        </body>
      </html>
    `);
  } catch (e) {
    console.error('❌ Error during humanization:', e);
    res.status(500).send('Something went wrong while processing the essay.');
  }
});

app.get('/', (req, res) => {
  res.send('DestroyAI backend is live!');
});

app.listen(PORT, () => {
  console.log(`🚀 DestroyAI backend running on port ${PORT}`);
});
