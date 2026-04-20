import { Request, Response } from 'express';
import { recognizeReceipt } from '../services/ocrService';
import { parseReceiptText } from '../services/receiptParser';

export const processReceipt = async (req: Request, res: Response) => {
  try {
    console.log('processReceipt called');
    console.log('req.file:', req.file);

    if (!req.file) {
      return res.status(400).json({ message: 'Файл не передан' });
    }

    const filePath = req.file.path;
    console.log('filePath:', filePath);

    const rawText = await recognizeReceipt(filePath);
    console.log('rawText received, length:', rawText.length);

    const lines = rawText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const parsedItems = parseReceiptText(lines);
    console.log('parsedItems count:', parsedItems.length);

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