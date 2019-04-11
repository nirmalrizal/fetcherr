const puppeteer = require('puppeteer');
const { blockedResourceTypes, skippedResources } = require('./constants');

const fetchPageHtml = async fetchUrl => {
  const pageUrl = fetchUrl;
  const browser = await puppeteer.launch({
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
      '--window-size=1920x1080'
    ]
  });
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  await page.setUserAgent(
    'Mozilla/5.0 (iPhone; CPU iPhone OS 9_0_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13A404 Safari/601.1'
  );
  page.on('request', request => {
    const tempUrl = request.url();
    const requestUrl = tempUrl.split('?')[0].split('#')[0];
    if (
      blockedResourceTypes.indexOf(request.resourceType()) !== -1 ||
      skippedResources.some(resource => requestUrl.indexOf(resource) !== -1)
    ) {
      request.abort();
    } else {
      request.continue();
    }
  });
  const response = await page
    .goto(pageUrl, {
      timeout: 25000,
      waitUntil: 'networkidle2'
    })
    .catch(err => {
      console.log(err);
    });
  const responseStatus = response.status();
  if (responseStatus < 400) {
    await page.waitFor(5000);
    const html = await page.content();
    await browser.close();
    return html;
  }
  return 'error';
};

const validateUrl = str => {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i'
  ); // fragment locator
  return !!pattern.test(str);
};

module.exports = { fetchPageHtml, validateUrl };
