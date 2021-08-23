require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
mongoose.set('debug', true);

mongoose.connect('mongodb://localhost/freecode', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
});

const URLSchema = new mongoose.Schema({
  original_url: {
    type:String,
    unique:true
  },
  short_url: String,
});

const URL = mongoose.model('URL', URLSchema);

//URL.remove({}, () => console.log("cleared"))

let id = 3;
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({extended:true}))

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});


// Your first API endpoint
app.get('/api/hello', async function(req, res) {
  res.json({ greeting: 'hello API' })
});

app.post('/api/shorturl', async function(req, res){
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    url = req.body.url
    if(url.match(pattern)){
      const newUrl = await URL.create({
        original_url:url,
        short_url:id
      })
      id++;
      const {original_url, short_url} = newUrl;
      res.json({original_url, short_url})
    }
    else res.json({error:'invalid url'})
})

app.get('/api/shorturl/:id', async function(req, res){
  const urlId = req.params;
  const url = await URL.findOne({'short_url':req.params.id});
  console.log()
  res.redirect(url.original_url)
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
