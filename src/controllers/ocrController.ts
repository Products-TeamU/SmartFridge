import { Request, Response } from 'express';
import { recognizeReceipt } from '../services/ocrService';
import { parseReceiptText } from '../services/receiptParser';

export const processReceipt = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Файл не передан' });
    }

    const filePath = req.file.path;

    const rawText = await recognizeReceipt(filePath);

    const lines = rawText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const parsedItems = parseReceiptText(lines);

    return res.json({
      rawText,
      lines,
      parsedItems,
    });
  } catch (error) {
    console.error('OCR error:', error);
    return res.status(500).json({ message: 'Ошибка OCR' });
  }
};