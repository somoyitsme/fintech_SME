module.exports = {
  apps: [
    {
      name: 'finpilot-db',
      cwd: '/home/host_server/finpilot/db-server',
      script: 'node_modules/.bin/tsx',
      args: 'watch src/index.ts',
      env: {
        PORT: 3001,
        NODE_ENV: 'production'
      }
    },
    {
      name: 'finpilot-agent',
      cwd: '/home/host_server/finpilot/agent',
      script: '.venv/bin/uvicorn',
      args: 'app.main:app --host 0.0.0.0 --port 8100',
      interpreter: 'none',
      env: {
        PORT: 8100
      }
    },
    {
      name: 'finpilot-frontend',
      cwd: '/home/host_server/finpilot/frontend',
      script: 'node_modules/.bin/vite',
      args: '--host 0.0.0.0 --port 5173',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
