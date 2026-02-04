// Proxy-Konfiguration für `ng serve`.
//
// Ziele:
// - Frontend soll unabhängig vom konkreten Backend-Host/Port sein.
// - Standard: Flask läuft lokal auf 127.0.0.1:5000.
// - Override per Environment-Variablen möglich:
//     set PROXY_TARGET=http://127.0.0.1:5001
//     npm start
//
// Hinweis: Diese Datei wird nur im Development (ng serve) genutzt.

const target = process.env.PROXY_TARGET || 'http://127.0.0.1:5000';

module.exports = {
  '/api': {
    target,
    secure: false,
    changeOrigin: true,
    logLevel: 'info',
  },
};

