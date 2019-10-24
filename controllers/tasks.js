var fs = require("fs");
const os = require("os");
const path = require("path");
const { Worker } = require("worker_threads");
const TaskModel = require("../models/task");
const NS_PER_SEC = 1e9;

const getContent = () => {
  return new Promise((resolve, reject) => {
    TaskModel.findOne(
      {
        id: 1
      },
      (err, item) => {
        if (err) reject(err);
        else resolve(item);
      }
    ).catch(err => {
      reject(err);
    });
  });
};

const addContent = text => {
  return new Promise((resolve, reject) => {
    const task = new TaskModel({
      content: text,
      id: 1
    });

    task
      .save()
      .then(task => {
        resolve(task);
      })
      .catch(err => {
        reject(err);
      });
  });
};

const writeInFile = task => {
  return new Promise(async (resolve, reject) => {
    await run();
    resolve(true);
  });
};

const fileWriteFromWorkerThread = number => {
  return new Promise(async (parentResolve, parentReject) => {
    const cores = os.cpus().length;
    const segmentSize = Math.ceil(number / cores);
    const segmentCount = Math.ceil(number / segmentSize);
    const segments = [];

    // console.log(numbers.length, cores, segmentSize, segmentCount);

    for (let index = 0; index < segmentCount; index++) {
      let temp = {
        fileName: `file${index}`,
        size: segmentSize
      };
      segments.push(temp);
    }

    try {
      const results = await Promise.all(
        segments.map(segment => {
          return new Promise((resolve, reject) => {
            const worker = new Worker(path.resolve("./workers/fileWriter.js"), {
              workerData: segment
            });
            worker.on("message", resolve);
            worker.on("error", reject);
            worker.on("exit", code => {
              if (code !== 0)
                reject(new Error(`Worker stopped with exit code ${code}`));
            });
          });
        })
      );
      parentResolve(results);
    } catch (e) {
      parentReject(e);
    }
  });
};

const fileWriteFromMainThread = number => {
  return new Promise((resolve, reject) => {
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
      fs.appendFileSync(`temp.txt`, data, err => {
        if (err) reject(err);
      });
    } while (index < number);
    resolve(true);
  });
};

const benchMark = async (funcName, number, label) => {
  const startTime = process.hrtime();
  await funcName(number).then();
  const diffTime = process.hrtime(startTime);
  console.log(
    `${label} took ${diffTime[0] + diffTime[1] / NS_PER_SEC} seconds`
  );
};

//cross = 11081
const run = async () => {
  await benchMark(fileWriteFromMainThread, 10000000, "Main thread");
  await benchMark(fileWriteFromWorkerThread, 10000000, "Worker thread");
};

/**
 * all logic here
 */
const Task = {
  add: (req, res) => {
    addContent(req.body.content)
      .then(task => {
        if (task) {
          res.status(200).send({
            message: "task added"
          });
        }
      })
      .catch(err => {
        res.status(400).send({
          message: "task not added"
        });
      });
  },
  perform: (req, res) => {
    getContent()
      .then(task => {
        if (task) {
          writeInFile(task)
            .then(() => {
              res.status(200).send({
                message: "file writing successful"
              });
            })
            .catch(err => {
              res.status(400).send({
                message: "file writing failed"
              });
            });
        }
      })
      .catch(err => {
        res.status(400).send({
          message: "task not added"
        });
      });
  }
};

module.exports = Task;
