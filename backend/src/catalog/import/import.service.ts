import { BadRequestException, Injectable } from '@nestjs/common';
import ExcelJS from 'exceljs';
import { parse as parseCsv } from 'csv-parse/sync';
import type { ImportResultDto } from '@imora/shared-types';
import type { UploadableFile } from '../storage/storage.service';
import { CategoriesService } from '../categories/categories.service';
import { ProductsService } from '../products/products.service';
import { ImportRowInput, parseImportRow } from './parse-import-row';

const MAX_ROWS = 2000;

/**
 * Store bulk upload (AC-03). Accepts .xlsx or .csv with columns:
 * categorySlug, name, description?, unit, price, currency?, inStock?, attributes?(JSON)
 * Row parsing lives in `parseImportRow` (pure, unit tested); this service only
 * does file I/O and per-row persistence, and never aborts the whole batch —
 * bad rows are reported back, good rows still get created.
 */
@Injectable()
export class ImportService {
  constructor(
    private readonly products: ProductsService,
    private readonly categories: CategoriesService,
  ) {}

  async importForStore(storeId: string, file: UploadableFile): Promise<ImportResultDto> {
    const rows = await this.readRows(file);
    if (rows.length > MAX_ROWS) {
      throw new BadRequestException(`Import too large: ${rows.length} rows (max ${MAX_ROWS})`);
    }

    let created = 0;
    const failed: { row: number; error: string }[] = [];

    for (let i = 0; i < rows.length; i += 1) {
      const rowNumber = i + 2; // header is row 1
      try {
        const parsed = parseImportRow(rows[i]);
        const category = await this.categories.findBySlugOrFail(parsed.categorySlug);
        await this.products.createForStore(storeId, {
          categoryId: category.id,
          name: parsed.name,
          description: parsed.description ?? undefined,
          unit: parsed.unit,
          imageUrls: [],
          attributes: parsed.attributes,
          price: parsed.price,
          currency: parsed.currency,
          inStock: parsed.inStock,
        });
        created += 1;
      } catch (error) {
        failed.push({
          row: rowNumber,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return { created, failed };
  }

  private async readRows(file: UploadableFile): Promise<ImportRowInput[]> {
    const isCsv = file.mimeType === 'text/csv' || file.originalName.toLowerCase().endsWith('.csv');
    return isCsv ? this.readCsv(file.buffer) : this.readXlsx(file.buffer);
  }

  private async readXlsx(buffer: Buffer): Promise<ImportRowInput[]> {
    const workbook = new ExcelJS.Workbook();
    // exceljs ships its own Buffer type from a different @types/node lineage
    // than this project's; structurally identical at runtime.
    await workbook.xlsx.load(buffer as unknown as Parameters<typeof workbook.xlsx.load>[0]);
    const sheet = workbook.worksheets[0];
    if (!sheet) {
      return [];
    }

    const headers: string[] = [];
    sheet.getRow(1).eachCell((cell, colNumber) => {
      headers[colNumber] = String(cell.value ?? '').trim();
    });

    const rows: ImportRowInput[] = [];
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        return;
      }
      const record: ImportRowInput = {};
      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber];
        if (header) {
          record[header] = cell.value;
        }
      });
      if (Object.keys(record).length > 0) {
        rows.push(record);
      }
    });
    return rows;
  }

  private readCsv(buffer: Buffer): ImportRowInput[] {
    return parseCsv(buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    }) as ImportRowInput[];
  }
}
