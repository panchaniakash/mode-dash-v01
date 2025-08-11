const express = require('express');
const http = require('http');
const fs = require('fs');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;


const server = http.createServer(app);

const corsOptions = {
 origin: (origin, callback) => {
   if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
     // Allow requests with no origin (like mobile apps or curl requests)
     callback(null, true);
   } else {
     callback(new Error('Not allowed by CORS'));
   }
 },
 optionsSuccessStatus: 200,
};
app.use(cors());
app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/views"));

app.use(express.json());




app.get('/index', (req, res) => {
    res.sendFile(__dirname + '/views/index.html');
})

app.get('/indexChairmanDaily', (req, res) => {
  res.sendFile(__dirname + '/views/indexChairmanDaily.html');
})


app.get('/indexChairmanMonthly', (req, res) => {
  res.sendFile(__dirname + '/views/indexChairmanMonthly.html');
})

var index = require('./routes/index')

app.use('/index', index)




// Middleware to restrict HTTP methods
const methodNotAllowed = (req, res, next) => {
  const allowedMethods = ['GET', 'POST'];
  if (!allowedMethods.includes(req.method)) {
    res.setHeader('X-Method-Not-Allowed', 'true');
    res.status(405).json({ message: 'Method Not Allowed' });
  } else {
    next();
  }
};

// Apply method restriction middleware globally
app.use(methodNotAllowed);




// Start the server
server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});