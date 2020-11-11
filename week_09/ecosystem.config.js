module.exports = {
  apps : [{
    script: 'wa09-b-app.js',
    watch: '.'
  }, {
    script: './service-worker/',
    watch: ['./service-worker'],
    env: {
          "PHOTON_ID": "3c001d000547393035313138",
          "PHOTON_TOKEN": "a432c27536f334fb34fd99584e95b7da879edd34",
          "AWSRDS_PW": "v8RnhPF8Qh",
        }
  }],

  deploy : {
    production : {
      user : 'SSH_USERNAME',
      host : 'SSH_HOSTMACHINE',
      ref  : 'origin/master',
      repo : 'GIT_REPOSITORY',
      path : 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
