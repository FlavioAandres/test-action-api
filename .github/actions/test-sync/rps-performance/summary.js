const ask = require('promptly');
const fs = require('fs');
const ndjson = require('ndjson');
const prettyMS = require('pretty-ms');
const percentile = require('stats-percentile');
const {table} = require('table');

const fileValidation = (value) => {
  const file = `${value}`;
  if (file.length < 3) throw Error('File path is too short');
  if (!fs.existsSync(file)) throw Error('File not found, please try again');

  return file;
};

let _DATA_ARRAY = [];
const buildArray = async (path) => {
  await new Promise((resolve) => {
    fs.createReadStream(path)
      .pipe(ndjson.parse({ strict: false }))
      .on('data', function (obj) {
        _DATA_ARRAY.push(obj);
      })
      .on('finish', () => {
        resolve(_DATA_ARRAY);
      });
  });

  return _DATA_ARRAY;
};

const init = async () => {
  let start;
  let filename;
  try {
    //Params
    filename = "bench-"+ (process.env.LINES || 1 ) + ".txt"

    //configs
    start = new Date();
    await buildArray(filename);
    const reqs = _DATA_ARRAY.filter((item) => item.line_type==="LINE_FINISH");
    const totalReqs = reqs.length;
    const totalSuccessReqs = reqs.filter((item) => item.isSuccessful).length;
    const totalFailedReqs = totalReqs - totalSuccessReqs;

    const sumTime = reqs.reduce((accumulator, current) => {
      return accumulator + current.time;
    }, 0);
    console.log('sumTime',sumTime)
    const avgTime = sumTime / totalReqs;
    const p95 = percentile(reqs.map((item) => item.time), 95);
    const p99 = percentile(reqs.map((item) => item.time), 99);
    output = table(
      [
        [
          'total reqs','total success reqs','total failed reqs', 
          'SUM ms', 'AVG ms', 'SUM human', 
          'AVG human', 'P95 human', 'P99 human'],
        [
          totalReqs,totalSuccessReqs,totalFailedReqs,
          sumTime.toFixed(3),
          avgTime.toFixed(3),prettyMS(sumTime),
          prettyMS(avgTime),prettyMS(p95),prettyMS(p99)
        ]
    ]
    );
 
    console.log(output);
    console.log('============================================');
    console.log(`Report generation time : ${prettyMS((new Date() - start) / 1000)}`);
    console.log('============================================');

    process.exit(0);
  } catch (error) {
    if (error.message !== 'canceled') console.info(error);
  }
  process.exit(1);
};

init();
