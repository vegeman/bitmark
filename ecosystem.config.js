module.exports = {
  apps: [
    {
      name: 'cloud',
      script: './server.js',
      instances: 2,
      exec_mode: 'cluster',
      // exec_interpreter: 'babel-node',
      autorestart: true,
      max_memory_restart: '1G',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      env: {
        NODE_ENV: 'development'
        //   MONGO_URL: 'mongodb://IP_ADDRESS',
        //   MONGO_PORT: DB_PORT_NUMBER,
        //   PORT: 80
      },
      env_production: {
        NODE_ENV: 'production'
        //   MONGO_URL: 'mongodb://IP_ADDRESS',
        //   MONGO_PORT: DB_PORT_NUMBER,
        //   PORT: PORT_NUMBER
      }
    }
  ]
}
