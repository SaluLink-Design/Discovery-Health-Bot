import cors from 'cors';
import express from 'express';
import { createAuthiService } from './authiService.js';
import { loadPdfIndex } from './pdfIndex.js';

const port = Number(process.env.PORT || 8787);
const app = express();

app.use(cors());
app.use(express.json());

const pdfIndex = await loadPdfIndex();
const authiService = createAuthiService(pdfIndex);

app.get('/api/health', (_request, response) => {
  response.json({
    ok: true,
    documents: pdfIndex.documents,
  });
});

app.post('/api/ask', (request, response) => {
  const query = typeof request.body?.query === 'string' ? request.body.query : '';
  response.json(authiService.ask(query));
});

app.listen(port, () => {
  console.log(`Authi API listening on http://localhost:${port}`);
});
