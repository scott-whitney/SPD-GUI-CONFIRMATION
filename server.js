const express = require("express");
const path = require("path");
const csv = require('csv-parser');
var mysql = require("mysql");
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

var connection = mysql.createConnection({
  host: "localhost",

  // Your port; if not 3306
  port: 3306,

  // Your username
  user: "root",

  // Your password
  // remember to change this to sacredherbtime when using at SPD
  password: "password",
  database: "tracking_information"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("connected as id " + connection.threadId + "\n");
});


var app = express();
var PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true}));
app.use(express.json());

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "index.html"))
});
app.get("/search", function(req, res) {
  res.sendFile(path.join(__dirname, "search.html"));
});
app.get("/subfolder", function(req, res) {
  res.sendFile(path.join(__dirname, "subfolder.html"));
})



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

app.post("/api/clear", async function(req, res) {
  console.log("begining to clear")

  await fs.writeFile('./RESULTS.csv', 'TRACKINGNUMBER,ORDERNUMBER,DATE,RECEIVER,COST,WEIGHT,RECEIVERORDERNUMBER', function(){console.log('done')})

  res.json("cleared")


})

app.get("/api/order/:search", async function(req, res) {
  // let csvWriter = createCsvWriter({
  //   path: './RESULTS.csv',
  //   header: [
  // {id: 'TRACKINGNUMBER', title: 'TRACKINGNUMBER'},
  // {id: 'ORDERNUMBER', title: 'ORDERNUMBER'},
  // {id: 'DATE', title: 'DATE'},
  // {id: 'RECEIVER', title: 'RECEIVER'},
  // {id: 'COST', title: 'COST'},
  // {id: 'WEIGHT', title: 'WEIGHT'},
  // {id: 'RECEIVERORDERNUMBER', title: 'RECEIVERORDERNUMBER'}
  //   ]
  // }); 
  // let searched = req.params.search;
  // let searchResults = [];
  // var resultsNow = [];
  // console.log(searched)

  // fs.createReadStream(backupPath)
  // .pipe(csv())
  // .on('data', (data) => resultsNow.push(data))
  // .on('end', () => {
    
  //   console.log('Backup Searched');
  //   let orderMultiple = resultsNow.filter(results => results.ORDERNUMBER == searched)
  //   searchResults = orderMultiple
  //   console.log('-----')
  //   console.log(searchResults)
  //   console.log('------')


  //   csvWriter.fileWriter.path = `./RESULTS.csv`
  //   console.log('attempting to use csv-writer')
  //   csvWriter.writeRecords(searchResults)
  //   .then(() => {
  //     console.log('Results Saved')
  //     res.json(searchResults)
  //   })

  console.log(req.params.search)
  console.log("Bringing up OrderNumer from tracking");
  // connection.query("SELECT * FROM tracking", function(err, res) {
  //     if (err) throw err;
  //     console.table(res)
  //     // console.log(res)
  //     // response = res;
  //     // console.log(response)
  //     // res.json(res)
  //     // res.json(res)
      
  // })
  connection.query(`SELECT * FROM tracking WHERE order_number = ${req.params.search}`, (err, rows) => {
    if (err) throw err;
    res.json(rows)
  })

  console.log("awaited?")

  });
  




  

app.get("/api/tracking/:search", async function(req, res) {
  // let csvWriter = createCsvWriter({
  //   path: './RESULTS.csv',
  //   header: [
  // {id: 'TRACKINGNUMBER', title: 'TRACKINGNUMBER'},
  // {id: 'ORDERNUMBER', title: 'ORDERNUMBER'},
  // {id: 'DATE', title: 'DATE'},
  // {id: 'RECEIVER', title: 'RECEIVER'},
  // {id: 'COST', title: 'COST'},
  // {id: 'WEIGHT', title: 'WEIGHT'},
  // {id: 'RECEIVERORDERNUMBER', title: 'RECEIVERORDERNUMBER'}
  //   ]
  // }); 
  // let searched = req.params.search;
  // let searchResults = [];
  // var resultsNow = [];
  // console.log(searched)

  // fs.createReadStream(backupPath)
  // .pipe(csv())
  // .on('data', (data) => resultsNow.push(data))
  // .on('end', () => {
    
  //   console.log('Backup Searched');
    // let orderMultiple = resultsNow.filter(results => results.TRACKINGNUMBER == searched)
    // searchResults = orderMultiple
    // console.log('-----')
    // console.log(searchResults)
    // console.log('------')


    // csvWriter.fileWriter.path = `./RESULTS.csv`
    // console.log('attempting to use csv-writer')
    // csvWriter.writeRecords(searchResults)
    // .then(() => {
    //   console.log('Results Saved')
    //   console.log(searchResults)
    //   res.json(searchResults)
    // })
    console.log(req.params.search)
    console.log("Bringing up tracking_number from tracking");
    connection.query(`SELECT * FROM tracking WHERE tracking_number = ${req.params.search}`, (err, rows) => {
      if (err) throw err;
      console.log('ey?')
      console.log(rows)
      res.json(rows)
    })
  });
  

app.post("/api/receiver/:search", function(req, res) {
  let csvWriter = createCsvWriter({
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
  let searched = req.params.search;
  let searchResults = [];
  var resultsNow = [];
  console.log(searched)

  fs.createReadStream(backupPath)
  .pipe(csv())
  .on('data', (data) => resultsNow.push(data))
  .on('end', () => {
    
    console.log('Backup Searched');
    let orderMultiple = resultsNow.filter(results => results.RECEIVER == searched)
    searchResults = orderMultiple
    console.log('-----')
    console.log(searchResults)
    console.log('------')


    csvWriter.fileWriter.path = `./RESULTS.csv`
    console.log('attempting to use csv-writer')
    csvWriter.writeRecords(searchResults)
    .then(() => {
      console.log('Results Saved')
      console.log(searchResults)
      res.json(searchResults)
    })
  });
  
})
// need to start making a duplicate - in order to connect to the second computer - this will be hard to do remotely.

// app.listen(3000, '0.0.0.0', function() {
//   console.log('Listening to port: ' + 3000);
// });




app.listen(PORT, function() {
  console.log("App listening on PORT " + PORT);
});