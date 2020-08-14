const express = require("express");
const path = require("path");
const csv = require('csv-parser');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const csvWriter = createCsvWriter({
  path: './RESULTS.csv',
  header: [
{id: 'TRACKINGNUMBER', title: 'TRACKINGNUMBER'},
{id: 'ORDERNUMBER', title: 'ORDERNUMBER'},
{id: 'DATE', title: 'DATE'},
{id: 'RECEIVER', title: 'RECEIVER'},
{id: 'COST', title: 'COST'},
{id: 'WEIGHT', title: 'WEIGHT'},
{id: 'RECEIVERORDERNUMBER', title: 'RECEIVERORDERNUMBER'}
  ]
}); 

var results = [];
var currentSearch = []
var newSubFolder = []
var updateResults = []

const masterPath = 'UPS_CONFIRMATIONS.csv'
const backupPath = 'UPS_DATA_BACKUP.csv'
const backupFolderPath = 'UPS_DATA_ORGANIZED'
const resultsPath = 'RESULTS.csv'


var app = express();
var PORT = 3001;

app.use(express.urlencoded({ extended: true}));
app.use(express.json());

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "index.html"))
});
app.get("/search", function(req, res) {
  res.sendFile(path.join(__dirname, "search.html"));
});



app.get("/api/update", function(req, res) {
  console.log("begining backup generation using master CSV - this should be almost instant")
  fs.copyFile(masterPath, backupPath, (err) => {
    if (err) throw err;
    console.log('backup file created')
    console.log('double checking firing off initial setup checks')
    
  })
  res.json("did it update?")
});



app.get("/api/search", function(req, res) {

  console.log("looking for search results")
  fs.createReadStream(resultsPath)
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    console.log('Data Ready hit arrow key');
  });
  res.json(results)
  results = []
})

app.post("/api/order/:search", function(req, res) {
  let searched = req.params.search;
  let searchResults = [];
  var resultsNow = [];
  console.log(searched)

  fs.createReadStream(backupPath)
  .pipe(csv())
  .on('data', (data) => resultsNow.push(data))
  .on('end', () => {
    
    console.log('Backup Searched');
    let orderMultiple = resultsNow.filter(results => results.ORDERNUMBER == searched)
    searchResults = orderMultiple
    console.log('-----')
    console.log(searchResults)
    console.log('------')


    csvWriter.fileWriter.path = `./RESULTS.csv`
    console.log('attempting to use csv-writer')
    csvWriter.writeRecords(searchResults)
    .then(() => {
      console.log('Results Saved')
    })
  });
  




  res.json('got it')
})





app.listen(PORT, function() {
  console.log("App listening on PORT " + PORT);
});