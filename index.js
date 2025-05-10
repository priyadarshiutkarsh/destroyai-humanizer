const express = require('express');
const puppeteer = require('puppeteer-core');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('DestroyAI backend is live!');
});

app.post('/Humanize', async (req, res) => {
  const { essay } = req.body;
  console.log("Essay received:", essay);

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto('https://ai-text-humanizer.com/', { waitUntil: 'networkidle2' });
    await page.waitForSelector('#textareaBefore');
    await page.type('#textareaBefore', essay);

    await page.click('#submit-button'); // Adjust this if needed

    await page.waitForSelector('#textareaAfter'); // Result
    await page.waitForTimeout(7000);

    const result = await page.$eval('#textareaAfter', el => el.value || el.innerText);

    await browser.close();

    res.send(`
      <html>
        <head><title>Humanized Result</title></head>
        <body style="font-family: sans-serif; padding: 2em;">
          <h2>✅ Your Humanized Essay:</h2>
          <pre style="background: #f4f4f4; padding: 1em;">${result}</pre>
        </body>
      </html>
    `);
  } catch (e) {
    console.error(e);
    res.status(500).send("Something went wrong while humanizing.");
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`DestroyAI backend running on port ${PORT}`));
