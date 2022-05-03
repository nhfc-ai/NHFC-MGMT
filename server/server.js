const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const MYSQLStore = require('express-session-sequelize')(session.Store);
const next = require('next');
const compression = require('compression');
const helmet = require('helmet');

// const Sequelize = require('sequelize');
const logger = require('./logger');
const { insertTemplates } = require('./models/EmailTemplate');
const getRootUrl = require('../lib/api/getRootUrl');
// const User = require('./models/User');
const { initMigrateData } = require('./models/Group');

const { newMysqlInstance } = require('./utils/utils');

const setupGoogle = require('./google');
const fileSystem = require('./filesystem');
const api = require('./api');

require('dotenv').config();

const dev = process.env.NODE_ENV !== 'production';
// const MONGO_URL = process.env.MONGO_URL_TEST;

// const options = {
//   useNewUrlParser: true,
//   useCreateIndex: true,
//   useFindAndModify: false,
//   useUnifiedTopology: true,
// };

const port = process.env.PORT || 8000;
const ROOT_URL = getRootUrl();

const URL_MAP = {
  '/login': '/public/login',
  '/contact': '/public/contact',
};

const app = next({ dev });
const handle = app.getRequestHandler();

const myDatabase = newMysqlInstance();

// const myDatabase = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
//   host: process.env.MYSQL_SERVER,
//   dialect: 'mysql',
// });

// Nextjs's server prepared
app.prepare().then(async () => {
  // await tf.setBackend('cpu');
  const server = express();
  server.use(helmet({ contentSecurityPolicy: false }));
  server.use(compression());

  if (process.env.REQUIRE_INIT_GROUP === 'true') {
    console.log('Starting initiate Group Data');
    try {
      await initMigrateData();
      console.log('Initiate Group Data Done.');
    } catch (err) {
      console.error('Init Group error:', err);
    }
  }

  // confuring mysql session store
  const sess = {
    name: process.env.SESSION_NAME,
    secret: process.env.SESSION_SECRET,
    store: new MYSQLStore({ db: myDatabase }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      maxAge: 14 * 24 * 60 * 60 * 1000,
      domain: process.env.COOKIE_DOMAIN,
    },
  };

  if (!dev) {
    server.set('trust proxy', 1); // sets req.hostname, req.ip
    sess.cookie.secure = false; // sets cookie over HTTPS only
  }

  server.use(session(sess));

  await insertTemplates();

  server.use(cors());
  server.use(bodyParser.urlencoded({ extended: true, parameterLimit: 100000, limit: '50mb' }));
  server.use(bodyParser.json({ limit: '50mb' }));

  // server.get('/', async (req, res) => {
  //   // await User.create({
  //   //   department: 'AI Research',
  //   //   displayName: 'Jia Wang',
  //   //   email: 'jia.wang@nhfc.com',
  //   //   googleId: process.env.GOOGLE_CLIENTID,
  //   //   avatarUrl:
  //   //     'https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg?sz=128',

  //   // });
  //   const user = await User.findOne({ department: 'AI Research' });
  //   req.user = user;
  //   app.render(req, res, '/');
  // });

  setupGoogle({ server, ROOT_URL });
  fileSystem({ server });
  api(server);

  // server.get('*', (req, res) => handle(req, res));

  server.get('*', (req, res) => {
    const url = URL_MAP[req.path];
    if (url) {
      app.render(req, res, url);
    } else {
      handle(req, res);
    }
  });

  // starting express server
  server.listen(port, (err) => {
    if (err) throw err;
    logger.info(`> Ready on ${ROOT_URL}`); // eslint-disable-line no-console
  });
});
