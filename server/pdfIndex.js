import fs from 'node:fs/promises';
import path from 'node:path';
import { PDFParse } from 'pdf-parse';

const repoRoot = process.cwd();

const pdfSources = [
  {
    id: 'treatment_basket',
    label: 'Treatment Baskets for the Chronic Disease List Conditions 2026',
    fileName: 'treatment-baskets-for-the-pmb-cdl-conditions.pdf',
  },
  {
    id: 'medicine_list',
    label: 'Chronic Illness Benefit Medicine List 2026',
    fileName: 'chronic-illness-benefit-medicine-list.pdf',
  },
  {
    id: 'hospital_network',
    label: 'Quality Care in Our Hospital Network 2026',
    fileName: 'dhms-hospital-network-list.pdf',
  },
];

const normalizeWhitespace = (value) => value.replace(/\s+/g, ' ').trim();

const createSnippet = (text, keywords) => {
  const lowered = text.toLowerCase();
  const keyword = keywords.find((item) => lowered.includes(item));

  if (!keyword) {
    return normalizeWhitespace(text.slice(0, 420));
  }

  const matchIndex = lowered.indexOf(keyword);
  const start = Math.max(0, matchIndex - 180);
  const end = Math.min(text.length, matchIndex + 280);

  return normalizeWhitespace(text.slice(start, end));
};

export const loadPdfIndex = async () => {
  const entries = await Promise.all(
    pdfSources.map(async (source) => {
      const filePath = path.join(repoRoot, source.fileName);
      const buffer = await fs.readFile(filePath);
      const parser = new PDFParse({ data: buffer });
      const parsed = await parser.getText();
      await parser.destroy();

      return {
        ...source,
        text: parsed.text || '',
      };
    }),
  );

  return {
    documents: entries.map((entry) => ({
      id: entry.id,
      label: entry.label,
      fileName: entry.fileName,
    })),
    getDocumentSnippet(documentId, keywords) {
      const document = entries.find((entry) => entry.id === documentId);

      if (!document) {
        return null;
      }

      return {
        documentId,
        source: document.label,
        excerpt: createSnippet(document.text, keywords),
      };
    },
  };
};
