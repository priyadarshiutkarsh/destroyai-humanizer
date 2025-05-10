const express = require('express');
const puppeteer = require('puppeteer-core');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/humanize', async (req, res) => {
  const essay = req.body['Enter the Essay You Want to Destroy'] || req.body.essay;

  console.log('📝 Received essay:', essay);

  if (!essay) {
    return res.status(400).send('No essay provided');
  }

  try {
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome',
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    await page.goto('https://ai-text-humanizer.com', { waitUntil: 'networkidle2' });

    // Type the essay into the input textarea
    await page.waitForSelector('textarea');
    await page.type('textarea', essay);

    // Click the "Humanize Text" button
    await page.click('button[class*="btn"]');

    // Wait for the humanized output to appear
    await page.waitForTimeout(7000); // Adjust if necessary

    // Extract the result from the same textarea (site replaces the value)
    const result = await page.evaluate(() => {
      const el = document.querySelector('textarea');
      return el ? el.value : '⚠️ Could not extract result';
    });

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
