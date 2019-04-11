const express = require('express');

const app = express();
const PORT = process.env.PORT || 5000;

const { fetchPageHtml, validateUrl } = require('./fetchData');

app.get('/fetch', async (req, res) => {
  try {
    const { url } = req.query;
    if (validateUrl(url)) {
      const html = await fetchPageHtml(url);
      res.send(html);
    } else {
      res.send('Invalid url. Please try with different url');
    }
  } catch (err) {
    res.send(err);
  }
});

app.get('*', (req, res) => {
  res.json({
    status: 404,
    message: 'URL does not exist'
  });
});

app.listen(PORT, err => {
  if (err) {
    console.log('Error on running server');
  } else {
    console.log(`Server running on port ${PORT}`);
  }
});
