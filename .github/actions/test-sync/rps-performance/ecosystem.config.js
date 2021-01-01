module.exports = {
  apps: [
    {
      name: 'performance-app',
      script: 'handler.js',
      instances: 1,
      exec_mode: 'fork',
      max_memory_restart: '1000M',
      log_date_format: 'YYYY/MM/DD HH:mm:ss'
    }
  ],
};
