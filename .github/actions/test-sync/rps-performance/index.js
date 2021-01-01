

const got = require('got');
const keepAlive = require('./helpers/httpClient');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const util = require('util');
const Stopwatch = require('statman-stopwatch');
let {
  RPS_API_URL='https://api.rosters.providers.test.cebroker.com', 
  SYNC='/upload/xml',
  ASYNC='/async/upload',
  API_KEY_AUTH='7uJf38Oixh', 
  TIMEOUT_HTTP=900000,
  LINES=1
} = process.env;

let counter = 0;

const file = fs.createWriteStream(`bench-${LINES}.txt`, { flags: 'w' });

const logger = function (d) {
  file.write(util.format(d) + '\n');
  process.stdout.write(util.format(d) + '\n');
};
logger(`{"line_type":"GENERAL",msg:"starting job ${LINES}"}`);
const go = async () => {
  let response;
  counter++
  const id = counter;
  logger(`{"line_type":"LINE_START",request_id:${id}}`);
  const stopwatch = new Stopwatch(true);
  try {
    const uploadData = fs.readFileSync(
      path.join(
        __dirname, 
        `./uploads/${LINES}_attendees.xml`,
      ),
      'utf8'
    );

    response = await got.post(`${RPS_API_URL}${SYNC}`, {
      form: {
        upload: uploadData,
      },
      agent: {
        http: keepAlive.keepAliveHttpAgent,
        https: keepAlive.keepAliveHttpsAgent,
      },
      timeout: +TIMEOUT_HTTP,
      headers: {
        Authorization: API_KEY_AUTH,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    response = {
      isSuccessful: true,
      data: {
        headers: response.headers,
        url: response.url,
        method: response.method,
        statusCode: response.statusCode,
        statusMessage: response.statusMessage,
        timings: response.timings,
      },
    };
  } catch (error) {
    response = {
      isSuccessful: false,
      data: {
        message: error.message,
        stack: error.stack,
        headers: error.headers,
        url: error.url,
        method: error.method,
        statusCode: error.statusCode,
        statusMessage: error.statusMessage,
        name: error.name,
        code: error.code,
        timings: error.timings,
        event: error.event,
      },
    };
  }
  let elapsedMilliseconds = stopwatch.stop();

  const output = {
    "line_type":"LINE_FINISH",
    "time": +elapsedMilliseconds.toFixed(3),
    ...response,
  };
  logger(JSON.stringify(output));
};

module.exports = go

go()