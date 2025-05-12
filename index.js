const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const port = 9876;

const WINDOW_SIZE = 10;
const TIMEOUT_MS = 500;

const numberTypeMap = {
  p: 'primes',
  f: 'fibo',
  e: 'even',
  r: 'rand'
};

const baseUrl = 'http://20.244.56.144/evaluation-service/';

let storedNumbers = [1,3,5,7];

function isUnique(num) {
  return !storedNumbers.includes(num);
}

function addNumbers(newNumbers) {
  for (const num of newNumbers) {
    if (isUnique(num)) {
      if (storedNumbers.length >= WINDOW_SIZE) {
        storedNumbers.shift(); // remove oldest
      }
      storedNumbers.push(num);
    }
  }
}

function calculateAverage(numbers) {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, val) => acc + val, 0);
  return parseFloat((sum / numbers.length).toFixed(2));
}

app.get('/numbers/:numberid', async (req, res) => {
  const numberid = req.params.numberid;
  if (!numberTypeMap.hasOwnProperty(numberid)) {
    return res.status(400).json({ error: 'Invalid numberid. Use p, f, e, or r.' });
  }

  const url = baseUrl + numberTypeMap[numberid];

  const windowPrevState = [...storedNumbers];

  try {
    const response = await axios.get(url, { timeout: TIMEOUT_MS });
    const numbers = response.data.numbers || [];

    addNumbers(numbers);

    const windowCurrState = [...storedNumbers];
    const avg = calculateAverage(windowCurrState);

    res.json({
      windowPrevState,
      windowCurrState,
      numbers,
      avg
    });
  } catch (error) {
    // On timeout or error, respond with current stored numbers and average without updating
    const windowCurrState = [...storedNumbers];
    const avg = calculateAverage(windowCurrState);

    res.json({
      windowPrevState,
      windowCurrState,
      numbers: [],
      avg
    });
  }
});

// Serve the frontend index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Average Calculator Microservice listening at http://localhost:${port}`);
});
