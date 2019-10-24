const { parentPort, workerData } = require("worker_threads");
var fs = require("fs");

const file = workerData.fileName;
const length = workerData.size;

let index = 0;
do {
  index++;
  let date = new Date();
  const data =
    index +
    ". " +
    date.getHours() +
    ":" +
    date.getMinutes() +
    ":" +
    date.getSeconds() +
    "\n";
  fs.appendFileSync(`${file}.txt`, data, err => {
    if (err) reject(err);
  });
} while (index < length);

parentPort.postMessage(true);
