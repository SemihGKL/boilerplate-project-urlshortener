require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns')
const urlParser = require('url')
const { MongoClient } = require('mongodb')


const client = new MongoClient(process.env.MONGO_URL)
const db = client.db('urlShortFCC')
const urls = db.collection("urlShorter")

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors())

app.use('/public', express.static(`${process.cwd()}/public`));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint

app.get('/api/shorturl/:nb', async function(req, res) {
  console.log(req.params.nb);
  const nbUrl = req.params.nb;
  const targetURL = await urls.findOne({ short_url: +nbUrl })
  console.log(targetURL)
  res.redirect(targetURL.url)
});


app.post('/api/shorturl', (req, res) => {
  console.log('ici : ' + req.body)
  const url = req.body.url
  const dnslookup = dns.lookup(urlParser.parse(url).hostname, async (err, address) => {
    if (!address) {
      res.json({ error: 'Invalid URL' })
    } else {
      const urlCount = await urls.countDocuments({})
      const urlDoc = {
        url: req.body.url,
        short_url: urlCount
      }

      const result = await urls.insertOne(urlDoc)
      res.json({ original_url: url, short_url: urlCount })
    }
  })
})


app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
