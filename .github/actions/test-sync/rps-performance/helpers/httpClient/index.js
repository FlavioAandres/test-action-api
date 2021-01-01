const HttpAgent = require("agentkeepalive");
const HttpsAgent = HttpAgent.HttpsAgent;

const {
  AGENT_REQ_KEEPALIVE = true,
  AGENT_REQ_FREESOCKETTIMEOUT = 15000,
  AGENT_REQ_TIMEOUT = 30000,
  AGENT_REQ_MAXSOCKETS = 30,
  AGENT_REQ_MAXFREESOCKETS = 5,
} = process.env;

const config = {
  keepAlive: AGENT_REQ_KEEPALIVE,
  freeSocketTimeout: +AGENT_REQ_FREESOCKETTIMEOUT,
  timeout: +AGENT_REQ_TIMEOUT,
  maxSockets: +AGENT_REQ_MAXSOCKETS,
  maxFreeSockets: +AGENT_REQ_MAXFREESOCKETS,
};

const keepAliveHttpAgent = new HttpAgent(config);
const keepAliveHttpsAgent = new HttpsAgent(config);

const agents = { keepAliveHttpAgent, keepAliveHttpsAgent };

module.exports = agents;
