const express = require('express');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer-core'); // use core
const { executablePath } = require('puppeteer'); // import system path

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/Humanize', async (req, res) => {
  const { essay } = req.body;
  console.log("Essay received:", essay);

  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: executablePath(), // use system Chrome
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto('https://ai-text-humanizer.com/', { waitUntil: 'networkidle2' });
    await page.waitForSelector('#textareaBefore');
    await page.type('#textareaBefore', essay);

    await page.click('#submit-button'); // double-check this selector
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
  } catch (err) {
    console.error(err);
    res.status(500).send("Something went wrong while humanizing.");
  }
});

app.listen(10000, () => {
  console.log("DestroyAI backend running on port 10000");
});
