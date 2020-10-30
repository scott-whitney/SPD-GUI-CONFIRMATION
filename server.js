const express = require("express");
const path = require("path");
const Chart = require('chart.js');

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
var keyPage = 0;
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
  // test port
  port: 3306,

  // spd port

  // Your username
  user: "root",

  // Your password
  // change this to password when using it for testing
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
});
app.get("/confirmations", function(req, res) {
  res.sendFile(path.join(__dirname, "confirmations.html"))
});
app.get("/graph", function(req, res) {
  res.sendFile(path.join(__dirname, "graphs.html"))
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

app.post("/api/clear", async function(req, res) {
  console.log("begining to clear")
  keyPage = 0;

  await fs.writeFile('./RESULTS.csv', 'TRACKINGNUMBER,ORDERNUMBER,DATE,RECEIVER,COST,WEIGHT,RECEIVERORDERNUMBER', function(){console.log('done')})

  res.json("cleared")


})

app.get("/api/order/:search", async function(req, res) {
  

  console.log(req.params.search)
  console.log("Bringing up OrderNumer from tracking");
  connection.query(`SELECT * FROM tracking WHERE order_number = ${req.params.search}`, (err, rows) => {
    if (err) throw err;
    
    results = rows
    firstBatch = []
    pagenation = 0;
      if(results.length < 51){
        pagenation = results.length
      } else {
        pagenation = 50
      }
    for(var i =0; i < pagenation; i ++){
      console.log(i)
      firstBatch.push(results[i])
    }
    firstBatch.push(results.length)
    console.log(firstBatch)

    res.json(firstBatch)
  })
  console.log("awaited?")
  });

  app.get("/api/weight/:search", async function(req, res) {
  

    console.log(req.params.search)
    console.log("Bringing up OrderNumer from tracking");
    connection.query(`SELECT * FROM tracking WHERE weight = ${req.params.search}`, (err, rows) => {
      if (err) throw err;
      res.json(rows)
    })
  
    console.log("awaited?")
  
    });

    app.get("/api/cost/:search", async function(req, res) {
  

      console.log(req.params.search)
      console.log("Bringing up OrderNumer from tracking");
      connection.query(`SELECT * FROM tracking WHERE cost = ${req.params.search}`, (err, rows) => {
        if (err) throw err;

        res.json(rows)
      })
    
      console.log("awaited?")
    
      });
      app.get("/api/customerpicklist/:search", async function(req, res) {
  

        console.log(req.params.search)
        console.log("Bringing up OrderNumer from tracking");
        connection.query(`SELECT * FROM tracking WHERE receiver_order_number = ${req.params.search}`, (err, rows) => {
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


    connection.query(`SELECT * FROM tracking WHERE tracking_number = '${req.params.search}'`, (err, rows) => {
      if (err) throw err;
      res.json(rows)
    })
  });

app.get("/api/confirmations", function(req, res) {
  var today = new Date()
  console.log(today)
  res.json(today)
  // figure out date being spit out by the UPS into MYSQL
  // modify this date to match so you can compare it
  // make a mysql querie that grabs everysingle tracking line with that date
  // if there are none come back with a warning saying "no shipping data found for todays date - this may be because end of day hasn't updated the database yet"

})

app.get("/api/next/:key", function(req, res) {

  keyPage++
  console.log(keyPage)
  console.log("------------------")

  let pageLimit = 0
  let resultsRemaining = results.length - (keyPage * 5)
  let nextBatch = []
console.log("------ begining if statement ----------")
  if(resultsRemaining < 6){
    pageLimit = resultsRemaining
  } else {
    pageLimit = 5
  }
  console.log("---------begining for loop --------")
  for(var i = 0; i < pageLimit; i++ ){
    console.log(keyPage)
    nextBatch.push(results[(keyPage * 5) + i])
  }
  console.log(nextBatch)
  res.json(nextBatch)

})

app.get("/api/previous/:key", function(req, res) {
  keyPage--

  let pageLimit = 0
  let resultsRemaining = results.length - (keyPage * 5)
  let nextBatch = []

  if(keyPage == 0){
    for(var i = 0; i < 5; i++){
      nextBatch.push(results[i])
    }
    console.log(nextBatch)
    res.json(nextBatch)
  }



  if(resultsRemaining < 6){
    pageLimit = resultsRemaining
  } else {
    pageLimit = 5
  }
  
  for(var i = 0; i < pageLimit; i++ ){
    nextBatch.push(results[(keyPage * 5) + i])
  }
  console.log(nextBatch)
  res.json(nextBatch)


})

app.get("/api/receiver/:search", function(req, res) {
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
  //   let orderMultiple = resultsNow.filter(results => results.RECEIVER == searched)
  //   searchResults = orderMultiple
  //   console.log('-----')
  //   console.log(searchResults)
  //   console.log('------')


  //   csvWriter.fileWriter.path = `./RESULTS.csv`
  //   console.log('attempting to use csv-writer')
  //   csvWriter.writeRecords(searchResults)
  //   .then(() => {
  //     console.log('Results Saved')
  //     console.log(searchResults)
  //     res.json(searchResults)

  connection.query(`SELECT * FROM tracking WHERE receiver = '${req.params.search}'`, (err, rows) => {
    if (err) throw err;
    results = rows
    firstBatch = []
    pagenation = 0;
      if(results.length < 6){
        pagenation = results.length
      } else {
        pagenation = 5
      }
    for(var i =0; i < pagenation; i ++){
      console.log(i)
      firstBatch.push(results[i])
    }
    firstBatch.push(results.length)
    console.log(firstBatch)

    res.json(firstBatch)
  })
    });
// need to start making a duplicate - in order to connect to the second computer - this will be hard to do remotely.

// app.listen(3000, '0.0.0.0', function() {
//   console.log('Listening to port: ' + 3000);
// });




app.listen(PORT, function() {
  console.log("App listening on PORT " + PORT);
});