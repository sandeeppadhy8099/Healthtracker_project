const express = require('express');
const session = require('express-session');
const path = require('path');
const flash = require('connect-flash');

const authRoutes = require('./routes/auth');
const trackerRoutes = require('./routes/tracker');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(session({
  secret: 'health-secret',
  resave: false,
  saveUninitialized: false
}));

app.use(flash());

app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
});

app.use('/auth', authRoutes); 
app.use('/tracker', trackerRoutes); 

app.get('/', (req, res) => {
  res.redirect('/auth/login');
});

const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

const PORT = 3000;
const HOST = '0.0.0.0'; 

app.listen(PORT, HOST, () => {
  const ip = getLocalIP();
  console.log(`Server running on:\n - http://localhost:${PORT}\n - http://${ip}:${PORT}`);
});

