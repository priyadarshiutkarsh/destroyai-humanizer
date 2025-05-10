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
    return res.status(400).send({ error: 'Essay is required' });
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.goto('https://ai-text-humanizer.com', {
      waitUntil: 'networkidle2'
    });

    await page.waitForSelector('#textareaBefore');
    await page.type('#textareaBefore', essay);

    await page.click('#submit'); // or match the actual Humanize button selector
    await page.waitForTimeout(10000); // give time for processing

    const result = await page.evaluate(() => {
      const output = document.querySelector('#textareaBefore'); // if text is replaced in same box
      return output ? output.value : '❌ No output found';
    });

    await browser.close();
    res.json({ result });
  } catch (err) {
    console.error(err);
    res.status(500).send({ error: 'Something went wrong' });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`DestroyAI backend running on port ${PORT}`);
});
