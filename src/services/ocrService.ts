
import { createWorker, PSM } from 'tesseract.js';
import type { CandidatePassportDetails } from '../types';

export interface OcrResult {
  details: CandidatePassportDetails;
  confidence: number;
  extractedFrom: 'mrz_parser' | 'pattern_match' | 'preset_sample';
  rawText?: string;
}

// Demo passports are intentionally disabled for real scans.
export const SAMPLE_PASSPORT_PRESETS: Array<{
  name: string;
  country: string;
  details: CandidatePassportDetails;
  previewUrl: string;
}> = [];

type ScanRegion = {
  name: string;
  image: string;
};

export interface PortraitCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export async function extractPassportPortrait(
  file: File,
  crop: PortraitCrop
): Promise<Blob> {
  const image = await loadImage(file);

  const canvas = document.createElement('canvas');
  const outputWidth = 400;
  const outputHeight = 500;

  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas unavailable');
  }

  const sx = Math.round(crop.x * image.naturalWidth);
  const sy = Math.round(crop.y * image.naturalHeight);
  const sw = Math.round(crop.width * image.naturalWidth);
  const sh = Math.round(crop.height * image.naturalHeight);

  if (
    sw <= 0 || sh <= 0 ||
    sx < 0 || sy < 0 ||
    sx + sw > image.naturalWidth ||
    sy + sh > image.naturalHeight
  ) {
    throw new Error('Invalid portrait crop');
  }

  ctx.drawImage(
    image,
    sx, sy, sw, sh,
    0, 0, outputWidth, outputHeight
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => blob
        ? resolve(blob)
        : reject(new Error('Portrait extraction failed')),
      'image/jpeg',
      0.9
    );
  });
}

function emptyDetails(): CandidatePassportDetails {
  return {
    passportNumber: '',
    citizenshipNumber: '',
    nationalIdNumber: '',
    surname: '',
    givenNames: '',
    fullName: '',
    gender: 'OTHER',
    dob: '',
    nationality: '',
    placeOfBirth: '',
    issueDate: '',
    expiryDate: '',
    issuingAuthority: '',
    permanentAddress: '',
    district: '',
    rawMrz: '',
  };
}

function isValidDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() + 1 === month &&
    date.getUTCDate() === day
  );
}

function mrzDate(value: string, expiry = false): string {
  if (!/^\d{6}$/.test(value)) return '';

  const yy = Number(value.slice(0, 2));
  const mm = value.slice(2, 4);
  const dd = value.slice(4, 6);

  const currentYear = new Date().getFullYear();
  const century = Math.floor(currentYear / 100) * 100;

  let year = century + yy;

  if (expiry) {
    if (year < currentYear - 20) year += 100;
    if (year > currentYear + 80) year -= 100;
  } else {
    if (year > currentYear) year -= 100;
  }

  const result = `${year}-${mm}-${dd}`;
  return isValidDate(result) ? result : '';
}

function mrzCheckDigit(value: string): string {
  const weights = [7, 3, 1];

  let sum = 0;

  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    let n = 0;

    if (char >= '0' && char <= '9') {
      n = Number(char);
    } else if (char >= 'A' && char <= 'Z') {
      n = char.charCodeAt(0) - 55;
    }

    sum += n * weights[i % 3];
  }

  return String(sum % 10);
}

function normalizeMrzLine(value: string): string {
  return value
    .toUpperCase()
    .replace(/\s/g, '')
    .replace(/«|‹/g, '<')
    .replace(/[^A-Z0-9<]/g, '');
}

// OCR frequently confuses O/0, I/1, B/8 and S/5.
// Apply substitutions only to fields that must contain digits.
function normalizeNumericField(value: string): string {
  return value
    .replace(/O/g, '0')
    .replace(/[IL]/g, '1')
    .replace(/B/g, '8')
    .replace(/S/g, '5')
    .replace(/Z/g, '2');
}

function validateMrzLine2(line: string): string | null {
  if (line.length !== 44) return null;

  const chars = line.split('');

  const numericPositions = [
    9, 19, 27, 42, 43,
    13, 14, 15, 16, 17, 18,
    21, 22, 23, 24, 25, 26,
  ];

  for (const pos of numericPositions) {
    chars[pos] = normalizeNumericField(chars[pos]);
  }

  const normalized = chars.join('');

  const passportField = normalized.slice(0, 9);
  const dobField = normalized.slice(13, 19);
  const expiryField = normalized.slice(21, 27);

  if (
    mrzCheckDigit(passportField) !== normalized[9] ||
    mrzCheckDigit(dobField) !== normalized[19] ||
    mrzCheckDigit(expiryField) !== normalized[27]
  ) {
    return null;
  }

  const composite =
    normalized.slice(0, 10) +
    normalized.slice(13, 20) +
    normalized.slice(21, 43);

  if (mrzCheckDigit(composite) !== normalized[43]) {
    return null;
  }

  if (
    !mrzDate(dobField) ||
    !mrzDate(expiryField, true)
  ) {
    return null;
  }

  return normalized;
}

export function parseMrzString(
  text: string
): Partial<CandidatePassportDetails> | null {
  const lines = text
    .split(/\r?\n/)
    .map(normalizeMrzLine)
    .filter(line => line.length >= 30);

  for (let i = 0; i < lines.length; i++) {
    const first = lines[i];
    const start = first.indexOf('P<');

    if (start < 0 || first.length - start < 44) continue;

    const line1 = first.slice(start, start + 44);

    if (!/^P<[A-Z<][A-Z<][A-Z<]/.test(line1)) continue;

    // OCR may insert one or more noise lines.
    for (let j = i + 1; j <= Math.min(i + 3, lines.length - 1); j++) {
      const candidate = lines[j];

      // The second line can be surrounded by OCR noise.
      for (
        let offset = 0;
        offset <= candidate.length - 44;
        offset++
      ) {
        const fragment = candidate.slice(offset, offset + 44);
        const line2 = validateMrzLine2(fragment);

        if (!line2) continue;

        const namesPart = line1.slice(5).split('<<');

        if (namesPart.length < 2) continue;

        const surname = namesPart[0]
          .replace(/</g, ' ')
          .trim();

        const givenNames = namesPart.slice(1)
          .join(' ')
          .replace(/</g, ' ')
          .trim();

        if (!surname || !givenNames) continue;

        const sex = line2[20];
        const nationalityCode = line2.slice(10, 13);

        return {
          passportNumber: line2.slice(0, 9).replace(/</g, ''),
          surname,
          givenNames,
          fullName: `${givenNames} ${surname}`.trim(),
          gender:
            sex === 'M' ? 'MALE' :
            sex === 'F' ? 'FEMALE' : 'OTHER',
          nationality:
            nationalityCode === 'NPL'
              ? 'NEPALESE'
              : nationalityCode,
          dob: mrzDate(line2.slice(13, 19)),
          expiryDate: mrzDate(line2.slice(21, 27), true),
          rawMrz: `${line1}\n${line2}`,
        };
      }
    }
  }

  return null;
}

async function loadImage(
  source: File | string
): Promise<HTMLImageElement> {
  const url =
    typeof source === 'string'
      ? source
      : URL.createObjectURL(source);

  try {
    const image = new Image();

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(
        new Error('Could not decode the uploaded image')
      );
      image.src = url;
    });

    return image;
  } finally {
    if (typeof source !== 'string') {
      URL.revokeObjectURL(url);
    }
  }
}

function makeCanvas(
  image: CanvasImageSource,
  width: number,
  height: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Browser Canvas is unavailable');
  }

  ctx.drawImage(image, 0, 0, width, height);

  return canvas;
}

function rotateCanvas(
  source: HTMLCanvasElement,
  degrees: 0 | 90 | 180 | 270
): HTMLCanvasElement {
  if (degrees === 0) return source;

  const swap = degrees === 90 || degrees === 270;

  const canvas = document.createElement('canvas');

  canvas.width = swap ? source.height : source.width;
  canvas.height = swap ? source.width : source.height;

  const ctx = canvas.getContext('2d')!;

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate(degrees * Math.PI / 180);
  ctx.drawImage(
    source,
    -source.width / 2,
    -source.height / 2
  );

  return canvas;
}

function cropCanvas(
  source: HTMLCanvasElement,
  x: number,
  y: number,
  width: number,
  height: number
): HTMLCanvasElement {
  const canvas = document.createElement('canvas');

  const sx = Math.max(0, Math.floor(x));
  const sy = Math.max(0, Math.floor(y));

  const sw = Math.min(
    source.width - sx,
    Math.max(1, Math.floor(width))
  );

  const sh = Math.min(
    source.height - sy,
    Math.max(1, Math.floor(height))
  );

  canvas.width = sw;
  canvas.height = sh;

  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(
    source,
    sx, sy, sw, sh,
    0, 0, sw, sh
  );

  return canvas;
}

function enhanceImage(
  source: HTMLCanvasElement,
  threshold: boolean
): string {
  // Avoid excessively large images.
  const scale = Math.min(
    3,
    Math.max(1, 1800 / source.width)
  );

  const canvas = makeCanvas(
    source,
    Math.round(source.width * scale),
    Math.round(source.height * scale)
  );

  const ctx = canvas.getContext('2d')!;

  const imageData = ctx.getImageData(
    0, 0, canvas.width, canvas.height
  );

  const data = imageData.data;

  for (let i = 0; i < data.length; i += 4) {
    const gray =
      data[i] * 0.299 +
      data[i + 1] * 0.587 +
      data[i + 2] * 0.114;

    const adjusted = Math.max(
      0,
      Math.min(255, (gray - 128) * 1.65 + 128)
    );

    const value = threshold
      ? (adjusted > 145 ? 255 : 0)
      : adjusted;

    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
  }

  ctx.putImageData(imageData, 0, 0);

  return canvas.toDataURL('image/png');
}

async function buildScanRegions(
  image: File | string
): Promise<ScanRegion[]> {
  const loaded = await loadImage(image);

  // Resize large scans to control memory usage.
  const scale = Math.min(
    1,
    2400 / Math.max(loaded.width, loaded.height)
  );

  const base = makeCanvas(
    loaded,
    Math.round(loaded.width * scale),
    Math.round(loaded.height * scale)
  );

  const regions: ScanRegion[] = [];

  // First try the original orientation.
  // Other orientations handle sideways passport scans.
  for (const angle of [0, 90, 270, 180] as const) {
    const rotated = rotateCanvas(base, angle);
    const w = rotated.width;
    const h = rotated.height;

    // Passport identity page at bottom.
    // const bottom = cropCanvas(
    //   rotated, 0, h * 0.66, w, h * 0.34
    // );
    const bottom = cropCanvas(
      rotated,
      0,
      h * 0.82,
      w,
      h * 0.18
    );

    // Passport identity page in lower-left quarter.
    const lowerLeft = cropCanvas(
      rotated, 0, h * 0.66, w * 0.55, h * 0.34
    );

    // Vertically stacked passport scan.
    const lowerHalf = cropCanvas(
      rotated, 0, h * 0.50, w, h * 0.50
    );

    regions.push({
      name: `${angle}deg-bottom-gray`,
      image: enhanceImage(bottom, false),
    });

    regions.push({
      name: `${angle}deg-bottom-binary`,
      image: enhanceImage(bottom, true),
    });

    regions.push({
      name: `${angle}deg-lower-left`,
      image: enhanceImage(lowerLeft, false),
    });

    regions.push({
      name: `${angle}deg-lower-half`,
      image: enhanceImage(lowerHalf, false),
    });
  }

  return regions;
}

function extractPrintedFields(
  rawText: string
): Partial<CandidatePassportDetails> {
  const details: Partial<CandidatePassportDetails> = {};

  const text = rawText
    .replace(/\r/g, '')
    .replace(/[ \t]+/g, ' ');

  // Recognize a few common date formats.
  const datePattern =
    /(\d{1,2})[\s/-]+(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|\d{1,2})[\s/-]+(\d{4})/i;

  const months: Record<string, string> = {
    JAN: '01', FEB: '02', MAR: '03',
    APR: '04', MAY: '05', JUN: '06',
    JUL: '07', AUG: '08', SEP: '09',
    OCT: '10', NOV: '11', DEC: '12',
  };

  function convertDate(input: string): string {
    const match = input.match(datePattern);

    if (!match) return '';

    const day = match[1].padStart(2, '0');
    const month = months[match[2].toUpperCase()] ||
      match[2].padStart(2, '0');

    const result = `${match[3]}-${month}-${day}`;

    return isValidDate(result) ? result : '';
  }

  const lines = text.split('\n').map(s => s.trim());

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const next = lines[i + 1] || '';

    if (/Date of Issue/i.test(line)) {
      const sameLine = line.match(datePattern);
      const nextLine = next.match(datePattern);

      const date = convertDate(
        sameLine?.[0] || nextLine?.[0] || ''
      );

      if (date) details.issueDate = date;
    }

    if (/Place of Birth/i.test(line)) {
      const match = line.match(
        /Place of Birth[:\s-]*([A-Z][A-Z ]{2,})/i
      );

      const value = match?.[1]?.trim() ||
        (/^[A-Z ]{3,30}$/.test(next) ? next : '');

      if (value) details.placeOfBirth = value;
    }

    if (/Citizenship\s*(?:No|Number)/i.test(line)) {
      const match = line.match(
        /Citizenship\s*(?:No|Number)[.:\s-]*([0-9][0-9-]{5,})/i
      );

      const nextMatch = next.match(/^[0-9][0-9-]{5,}$/);

      const value = match?.[1] || nextMatch?.[0];

      if (value) details.citizenshipNumber = value;
    }
  }

  return details;
}

export async function performPassportOcr(
  source: {
    file?: File;
    base64?: string;
    sampleId?: string;
  }
): Promise<OcrResult> {
  if (source.sampleId) {
    throw new Error(
      'Demo passport presets are disabled'
    );
  }

  if (!source.file && !source.base64) {
    throw new Error('Please upload a passport image');
  }

  if (
    source.file &&
    !['image/jpeg', 'image/png', 'image/webp'].includes(
      source.file.type
    )
  ) {
    throw new Error('Upload JPG, PNG or WEBP images only');
  }

  if (source.file && source.file.size > 15 * 1024 * 1024) {
    throw new Error('Maximum passport image size is 15 MB');
  }

  const image = source.file || source.base64!;

  const worker = await createWorker('eng');

  try {
    const regions = await buildScanRegions(image);

    await worker.setParameters({
      tessedit_char_whitelist:
        'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<',
      tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
      preserve_interword_spaces: '1',
    });

    let mrzDetails: Partial<CandidatePassportDetails> | null = null;
    let mrzConfidence = 0;
    let matchedRegion = '';

    for (const region of regions) {
      console.log(`[OCR] Trying ${region.name}`);

      const result = await worker.recognize(region.image);

      const parsed = parseMrzString(result.data.text);

      if (parsed) {
        mrzDetails = parsed;
        mrzConfidence = result.data.confidence / 100;
        matchedRegion = region.name;

        console.log('[OCR] Validated MRZ:', parsed.rawMrz);
        break;
      }
    }

    // Additional general OCR for printed passport fields.
    await worker.setParameters({
      tessedit_char_whitelist: '',
      tessedit_pageseg_mode: PSM.AUTO,
    });

    const fullResult = await worker.recognize(image);
    const rawText = fullResult.data.text;

    console.log('[OCR] Full document text:', rawText);

    if (!mrzDetails) {
      throw new Error(
        'Could not validate the passport MRZ. ' +
        'Ensure both MRZ lines are visible, sharp, ' +
        'horizontal and not covered by glare.'
      );
    }

    const printed = extractPrintedFields(rawText);

    const details: CandidatePassportDetails = {
      ...emptyDetails(),
      ...printed,
      ...mrzDetails,
    };

    console.log('[OCR] Matched region:', matchedRegion);
    console.log('[OCR] Extracted passport:', details);

    return {
      details,
      confidence: mrzConfidence,
      extractedFrom: 'mrz_parser',
      rawText,
    };
  } finally {
    await worker.terminate();
  }
}
