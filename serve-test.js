const express = require('express');
const path = require('path');
const app = express();

// Serve static files from 'out' directory under /QRetro path
app.use('/QRetro', express.static(path.join(__dirname, 'out')));

// Redirect root to /QRetro
app.get('/', (req, res) => {
  res.redirect('/QRetro/');
});

// Fallback for client-side routing
app.get('/QRetro/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'out', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/QRetro/`);
});
EOF < /dev/null