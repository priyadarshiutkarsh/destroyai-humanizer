const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/Humanize', async (req, res) => {
  const { essay } = req.body;
  console.log("Essay received:", essay);

  try {
    const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
    const page = await browser.newPage();

    await page.goto('https://ai-text-humanizer.com', { waitUntil: 'networkidle2' });
    await page.waitForSelector('#textareaBefore');
    await page.type('#textareaBefore', essay);

    await page.click('button[type="submit"]'); // adjust if incorrect
    await page.waitForSelector('#textareaAfter', { timeout: 15000 });

    const result = await page.$eval('#textareaAfter', el => el.value || el.innerText);
    await browser.close();

    res.send(`
      <html>
        <head><title>Result</title></head>
        <body style="font-family: sans-serif; padding: 2em;">
          <h2>✅ Humanized Text:</h2>
          <pre style="background: #f4f4f4; padding: 1em;">${result}</pre>
        </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send("An error occurred while humanizing the text.");
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`DestroyAI backend running on port ${PORT}`));
