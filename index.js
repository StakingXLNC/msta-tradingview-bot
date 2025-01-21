const puppeteer = require('puppeteer');
const axios = require('axios');
const FormData = require('form-data');

// Telegram Bot API details
const BOT_TOKEN = '8108892194:AAFH1hGnle4g3aBa7fJQsEz0TK2OrCO6i0Q';
const CHAT_ID = '-4605029522'; // Your chat ID
const CHART_BASE_URL = 'https://www.tradingview.com/chart/'; // Base URL for charts

async function captureAndSendScreenshot(alertData) {
  let browser;
  try {
    // Generate the chart URL dynamically based on the ticker
    const chartUrl = `${CHART_BASE_URL}${alertData.ticker}/`;

    // Launch a headless browser
    browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();

    // Set the viewport size (adjust as needed)
    await page.setViewport({ width: 1280, height: 720 });

    // Navigate to the TradingView chart
    await page.goto(chartUrl, { waitUntil: 'networkidle2' });

    // Capture a screenshot
    const screenshot = await page.screenshot({ type: 'png' });

    // Close the browser
    await browser.close();

    // Create the formatted message
    const message = `
🔥 *Level 2 Alert* 🔥

🚀 Symbol: *${alertData.ticker}*
💎 Price: \`${alertData.close}\`
📊 Exchange: *${alertData.exchange}*
⏰ Time: \`${alertData.time}\`
    `;

    // Send the message and screenshot to Telegram
    const formData = new FormData();
    formData.append('chat_id', CHAT_ID);
    formData.append('photo', screenshot, { filename: 'chart.png' });
    formData.append('caption', message);
    formData.append('parse_mode', 'Markdown');

    await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, formData, {
      headers: formData.getHeaders(),
    });

    console.log('Screenshot and message sent to Telegram!');
  } catch (error) {
    console.error('Error:', error);
    if (browser) await browser.close();
  }
}

// Export the function for Vercel
module.exports = async (req, res) => {
  const alertData = req.body; // TradingView sends alert data in the request body
  await captureAndSendScreenshot(alertData);
  res.status(200).send('Alert processed successfully!');
};
