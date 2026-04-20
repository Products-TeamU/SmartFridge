import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const runTesseract = (
  inputPath: string,
  outputBase: string,
  psm: number = 6
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const command = `tesseract "${inputPath}" "${outputBase}" -l rus+eng --oem 3 --psm ${psm}`;
    console.log('Running command:', command);

    exec(command, (error, stdout, stderr) => {
      console.log('Tesseract stdout:', stdout);
      console.log('Tesseract stderr:', stderr);

      if (error) {
        console.error('Tesseract exec error:', error);
        return reject(error);
      }

      try {
        const text = fs.readFileSync(outputBase + '.txt', 'utf-8');
        resolve(text);
      } catch (err) {
        reject(err);
      }
    });
  });
};

export const recognizeReceipt = async (filePath: string): Promise<string> => {
  const dir = path.dirname(filePath);
  const ext = path.extname(filePath);
  const name = path.basename(filePath, ext);

  const processedPath = path.join(dir, `${name}_processed.png`);
  const outputBase = path.join(dir, `${name}_out`);

  console.log('recognizeReceipt filePath:', filePath);
  console.log('processedPath:', processedPath);
  console.log('outputBase:', outputBase);

  try {
    await sharp(filePath)
      .grayscale()
      .normalize()
      .resize({ width: 2200, withoutEnlargement: false })
      .sharpen()
      .threshold(165)
      .toFile(processedPath);

    console.log('Sharp preprocessing done');

    const text = await runTesseract(processedPath, outputBase, 6);

    console.log('Tesseract text length:', text.length);

    return text;
  } finally {
    const filesToDelete = [filePath, processedPath, outputBase + '.txt'];

    for (const file of filesToDelete) {
      if (fs.existsSync(file)) {
        try {
          fs.unlinkSync(file);
        } catch (err) {
          console.error('Delete file error:', file, err);
        }
      }
    }
  }
};