let config = {
  localhost: {
    api: '',
  },
  development: {
    api: 'https://api.d.maiduote.com',
  },
  production: {
    api: 'https://api.t.maiduote.com',
  },
};

const defaultConfig = {
  title: '麦多特管理后台',
  describe: '麦多特－让康复更简单',
  copyright: '2018 麦多特网络科技有限公司',
  logLevel: 'debug',
};

console.log(process.env.NODE_ENV)
const env = process.env.NODE_ENV || 'localhost';
config = config[env] || config.localhost;
config.env = env;

const api = config.api

global.api = api

export default Object.assign({}, defaultConfig, config);

