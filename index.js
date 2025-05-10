const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer-core');
const { executablePath } = require('puppeteer');

const app = express();
app.use(bodyParser.json());

app.post('/Humanize', async (req, res) => {
  const { essay } = req.body;
  if (!essay) return res.status(400).send('Essay missing');

  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: executablePath(), // 🔑 Use Puppeteer's preinstalled Chromium
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto('https://ai-text-humanizer.com', { waitUntil: 'networkidle2' });
    await page.type('#textareaBefore', essay);
    await page.click('button[type="submit"]');
    await page.waitForSelector('#textareaAfter', { timeout: 10000 });

    const result = await page.$eval('#textareaAfter', el => el.value || el.innerText);
    await browser.close();

    res.send(`
      <html>
        <body style="font-family: sans-serif; padding: 2em;">
          <h2>Your Humanized Output:</h2>
          <pre>${result}</pre>
        </body>
      </html>
    `);
  } catch (e) {
    console.error("🔥 Puppeteer failed:", e);
    res.status(500).send("Something went wrong.");
  }
});

app.listen(10000, () => console.log("🚀 Server running on port 10000"));
