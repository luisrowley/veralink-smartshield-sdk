module.exports = {
  apps: [
    {
      name: 'veralink-smartshield-sdk',
      script: 'test/script.js',
      env_production: {
        NODE_ENV: 'prod',
      },
      env_development: {
        NODE_ENV: 'dev',
      },
    },
  ],
};
