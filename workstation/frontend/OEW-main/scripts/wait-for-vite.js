const http = require('http');

function checkViteServer(retries = 30) {
  return new Promise((resolve, reject) => {
    const check = (attemptsLeft) => {
      if (attemptsLeft <= 0) {
        return reject(new Error('Vite server did not start in time'));
      }

      http.get('http://localhost:5173', (res) => {
        if (res.statusCode === 200) {
          resolve();
        } else {
          setTimeout(() => check(attemptsLeft - 1), 1000);
        }
      }).on('error', () => {
        setTimeout(() => check(attemptsLeft - 1), 1000);
      });
    };

    check(retries);
  });
}

if (require.main === module) {
  checkViteServer()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}
