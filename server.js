import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const distPath = path.join(__dirname, 'dist');

// Check if dist folder exists
if (!existsSync(distPath)) {
  console.error('ERROR: dist folder not found! Please run "npm run build" first.');
  process.exit(1);
}

// Check if index.html exists
const indexPath = path.join(distPath, 'index.html');
if (!existsSync(indexPath)) {
  console.error('ERROR: index.html not found in dist folder! Build may have failed.');
  process.exit(1);
}

app.use(express.static(distPath));

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.get('*', (req, res) => {
  res.sendFile(indexPath);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Serving files from: ${distPath}`);
});