// ========================================
// Excel Generator with Full Formatting
// Compatible 100% with ref.py
// Uses ExcelJS for advanced formatting
// ========================================

class PD2ExcelGenerator {
    constructor(primaryData, extraData, hasFileC) {
        this.primaryData = primaryData;
        this.extraData = extraData;
        this.hasFileC = hasFileC;
        this.workbook = new ExcelJS.Workbook();
        this.MAX_PRIMARY_ROW = 83;
    }

    async generate() {
        const worksheet = this.workbook.addWorksheet('รายงานรวม', {
            views: [{ state: 'frozen', xSplit: 0, ySplit: 1 }]
        });

        // Add header
        this.addHeader(worksheet);

        // Add primary data (rows 2-84)
        this.addPrimaryData(worksheet);

        // Add summary section (rows 88-107)
        this.addSummarySection(worksheet);

        // Add extra data if exists (starting row 109)
        if (this.extraData.length > 0) {
            this.addExtraBlock(worksheet);
        }

        // Apply all formatting
        this.applyFormatting(worksheet);

        // Generate buffer
        const buffer = await this.workbook.xlsx.writeBuffer();
        return new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
    }

    addHeader(worksheet) {
        const headers = [
            'เครื่อง', 'พนักงานทอ กะ A', 'พนักงานทอ กะ B', 'ขนาดหน้าผ้า (รหัส)',
            'Lot.No', 'เลขที่ใบสั่งผลิต', 'ยอดทอ กะ A', 'ยอดทอ กะ B',
            'ความเร็วรอบ กะ A', 'ความเร็วรอบ กะ B', 'ประสิทธิภาพ (กะ A)%', 'ประสิทธิภาพ (กะ B)%',
            'มิเตอร์เริ่มงาน กะ A', 'มิเตอร์เลิกงาน กะ A', 'มิเตอร์เริ่มงาน กะ B', 'มิเตอร์เลิกงาน กะ B',
            'ความยาวตัดม้วน กะ A', 'ความยาวตัดม้วน กะ B',
            'น้ำหนักม้วน กะ A', 'น้ำหนักม้วน กะ B', 'จำนวนแผล กะ A', 'จำนวนแผล กะ B',
            'ค่าเฉลี่ย กะ A', 'ค่าเฉลี่ย กะ B', 'ความยาวตัดม้วน กะ A', 'ความยาวตัดม้วน กะ B',
            'ค่าแรงพนักงานกะ A', 'ค่าแรงพนักงานกะ B'
        ];

        worksheet.addRow(headers);

        // Format header row
        const headerRow = worksheet.getRow(1);
        headerRow.height = 30;
        headerRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFDDEBF7' }
            };
            cell.font = { bold: true };
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Set column widths
        const widths = [12, 18, 18, 15, 12, 16, 12, 12, 12, 12, 14, 14, 14, 14, 14, 14, 16, 16, 12, 12, 12, 12, 12, 12, 16, 16, 18, 18];
        widths.forEach((width, idx) => {
            worksheet.getColumn(idx + 1).width = width;
        });
    }

    addPrimaryData(worksheet) {
        this.primaryData.forEach((rowData, idx) => {
            const rowNum = idx + 2;
            const row = worksheet.addRow(this.buildDataRow(rowData, rowNum));

            // Apply borders and alternating colors
            row.eachCell((cell, colNumber) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };

                // Alternating row colors
                if (rowNum % 2 === 0) {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFF3F3F3' }
                    };
                }

                // Text columns (left align)
                if ([1, 2, 3, 4, 5, 6].includes(colNumber)) {
                    cell.alignment = { horizontal: 'left', vertical: 'middle' };
                }
                // Numeric columns (right align with number format)
                else if ([7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28].includes(colNumber)) {
                    cell.numFmt = '#,##0';
                    cell.alignment = { horizontal: 'right', vertical: 'middle' };
                }

                // Color for Y (col 25) and Z (col 26) if file C present
                if (this.hasFileC) {
                    if (colNumber === 25) {
                        cell.font = { color: { argb: 'FF0000FF' } }; // Blue
                    } else if (colNumber === 26) {
                        cell.font = { color: { argb: 'FFFF0000' } }; // Red
                    }
                }
            });
        });
    }

    buildDataRow(rowData, rowNum) {
        const M = rowNum, N = rowNum, O = rowNum, P = rowNum, Q = rowNum, R = rowNum;

        // Formula for "ยอดทอ กะ A" (column G = 7)
        const formulaG = `MAX(0,IF(M${M}>N${N},IF(Q${Q}<>"",Q${Q}-ABS(N${N}-M${M}),R${R}-ABS(N${N}-M${M})),N${N}-M${M}))`;

        // Formula for "ยอดทอ กะ B" (column H = 8)
        const formulaH = `MAX(0,IF(O${O}>P${P},IF(Q${Q}<>"",Q${Q}-ABS(P${P}-O${O}),R${R}-ABS(P${P}-O${O})),P${P}-O${O}))`;

        // Get size code and build rate formula
        const sizeCode = rowData['ขนาดหน้าผ้า (รหัส)'] || rowData['ขนาดหน้าผ้า_รหัส'] || '';
        const rateFormula = this.buildRateFormula(rowNum);

        // Formula for "ค่าแรงพนักงานกะ A" (column AA = 27)
        const formulaAA = `IFERROR(TEXT((${rateFormula})*G${rowNum},"0.00"),"คำนวณไม่สำเร็จ")`;

        // Formula for "ค่าแรงพนักงานกะ B" (column AB = 28)
        const formulaAB = `IFERROR(TEXT((${rateFormula})*H${rowNum},"0.00"),"คำนวณไม่สำเร็จ")`;

        return [
            rowData.machine || rowData['เครื่องทอ NO'] || '', // A
            rowData['พนักงานทอ กะ A'] || '', // B
            rowData['พนักงานทอ กะ B'] || '', // C
            sizeCode, // D
            rowData['Lot.No'] || '', // E
            rowData['เลขที่ใบสั่งผลิต'] || '', // F
            { formula: formulaG }, // G - ยอดทอ กะ A
            { formula: formulaH }, // H - ยอดทอ กะ B
            this.toNumber(rowData['ความเร็วรอบ กะ A']), // I
            this.toNumber(rowData['ความเร็วรอบ กะ B']), // J
            this.toNumber(rowData['ประสิทธิภาพ กะ A'] || rowData['ประสิทธิภาพ (กะ A)%']), // K
            this.toNumber(rowData['ประสิทธิภาพ กะ B'] || rowData['ประสิทธิภาพ (กะ B)%']), // L
            this.toNumber(rowData['มิเตอร์เริ่มงาน กะ A']), // M
            this.toNumber(rowData['มิเตอร์เลิกงาน กะ A']), // N
            this.toNumber(rowData['มิเตอร์เริ่มงาน กะ B']), // O
            this.toNumber(rowData['มิเตอร์เลิกงาน กะ B']), // P
            this.toNumber(rowData['ความยาวตัดม้วน กะ A'] || rowData['ความยาวตัดม้วน กะ A (เดิม)']), // Q
            this.toNumber(rowData['ความยาวตัดม้วน กะ B'] || rowData['ความยาวตัดม้วน กะ B (เดิม)']), // R
            '', // S - น้ำหนักม้วน กะ A
            '', // T - น้ำหนักม้วน กะ B
            '', // U - จำนวนแผล กะ A
            '', // V - จำนวนแผล กะ B
            '', // W - ค่าเฉลี่ย กะ A
            '', // X - ค่าเฉลี่ย กะ B
            this.toNumber(rowData['Y']), // Y - ความยาวตัดม้วน กะ A (จากไฟล์ C)
            this.toNumber(rowData['Z']), // Z - ความยาวตัดม้วน กะ B (จากไฟล์ C)
            { formula: formulaAA }, // AA - ค่าแรงพนักงานกะ A
            { formula: formulaAB }  // AB - ค่าแรงพนักงานกะ B
        ];
    }

    buildRateFormula(rowNum) {
        const D = `D${rowNum}`;
        const numExpr = `IF(LEFT(UPPER(${D}),3)="FCL",VALUE(MID(${D},6,2)),IF(LEFT(UPPER(${D}),4)="TEST",VALUE(MID(${D},5,2)),VALUE(LEFT(${D},2))))`;

        return `IFS(OR(${numExpr}=12,${numExpr}=13,${numExpr}=14,${numExpr}=15,${numExpr}=16,${numExpr}=17),0.13,OR(${numExpr}=18,${numExpr}=19,${numExpr}=20,${numExpr}=21,${numExpr}=22),0.14,OR(${numExpr}=23,${numExpr}=24,${numExpr}=25),0.15,OR(${numExpr}=26,${numExpr}=27,${numExpr}=28,${numExpr}=29,${numExpr}=30),0.18)`;
    }

    toNumber(val) {
        if (val === null || val === undefined || val === '') return null;
        const num = parseFloat(val);
        return isNaN(num) ? null : num;
    }

    addSummarySection(worksheet) {
        const maxRow = this.MAX_PRIMARY_ROW + 1;

        // Skip to row 88
        for (let i = maxRow + 2; i < 88; i++) {
            worksheet.addRow([]);
        }

        // Row 88: Summary header
        const now = new Date();
        const thaiYear = now.getFullYear() + 543;
        const dateLabel = `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${thaiYear}`;

        const row88 = worksheet.addRow([`สรุปยอดผลิตประจำวันที่ (${dateLabel})`]);
        worksheet.mergeCells('A88:B88');
        row88.getCell(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD9D9D9' }
        };
        row88.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
        row88.getCell(1).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };

        // Empty rows 89-90
        worksheet.addRow([]);
        worksheet.addRow([]);

        // Row 91: Labels
        const row91 = worksheet.addRow(['ยอดทอกะ A ทั้งหมด', 'ยอดทอกะ B ทั้งหมด']);
        row91.eachCell((cell) => {
            cell.font = { underline: true };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        // Row 92: Empty
        worksheet.addRow([]);

        // Row 93: Production totals
        const row93 = worksheet.addRow([
            { formula: `SUBTOTAL(109,G2:G${maxRow})` },
            { formula: `SUBTOTAL(109,H2:H${maxRow})` }
        ]);
        row93.eachCell((cell) => {
            cell.numFmt = '#,##0';
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Row 94: Combined total
        const row94 = worksheet.addRow([{ formula: 'A93+B93' }]);
        worksheet.mergeCells('A94:B94');
        row94.getCell(1).numFmt = '#,##0';
        row94.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
        row94.getCell(1).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };

        // Empty rows 95-96
        worksheet.addRow([]);
        worksheet.addRow([]);

        // Row 97: Cut labels
        const row97 = worksheet.addRow(['ยอดตัดม้วนกะ A ทั้งหมด', 'ยอดตัดม้วนกะ B ทั้งหมด']);
        row97.eachCell((cell) => {
            cell.font = { underline: true };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        // Row 98: Empty
        worksheet.addRow([]);

        // Row 99: Cut totals
        const row99 = worksheet.addRow([
            { formula: `SUBTOTAL(109,Q2:Q${maxRow})` },
            { formula: `SUBTOTAL(109,R2:R${maxRow})` }
        ]);
        row99.eachCell((cell) => {
            cell.numFmt = '#,##0';
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Row 100: Combined cut total
        const row100 = worksheet.addRow([{ formula: 'A99+B99' }]);
        worksheet.mergeCells('A100:B100');
        row100.getCell(1).numFmt = '#,##0';
        row100.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
        row100.getCell(1).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };

        // Empty rows 101-102
        worksheet.addRow([]);
        worksheet.addRow([]);

        // Row 103: Y+Z totals
        const row103 = worksheet.addRow([
            { formula: `SUBTOTAL(109,Y2:Y${maxRow})` },
            { formula: `SUBTOTAL(109,Z2:Z${maxRow})` }
        ]);
        row103.eachCell((cell, colNum) => {
            cell.numFmt = '#,##0';
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            // Color based on file C presence
            if (this.hasFileC) {
                cell.font = { color: { argb: colNum === 1 ? 'FF0000FF' : 'FFFF0000' } };
            }
        });

        // Row 104: Combined Y+Z
        const row104 = worksheet.addRow([{ formula: 'A103+B103' }]);
        worksheet.mergeCells('A104:B104');
        row104.getCell(1).numFmt = '#,##0';
        row104.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
        row104.getCell(1).border = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
        };
    }

    addExtraBlock(worksheet) {
        // Skip to row 109
        while (worksheet.rowCount < 108) {
            worksheet.addRow([]);
        }

        // Row 109: Header (same as row 1)
        const headers = [
            'เครื่อง', 'พนักงานทอ กะ A', 'พนักงานทอ กะ B', 'ขนาดหน้าผ้า (รหัส)',
            'Lot.No', 'เลขที่ใบสั่งผลิต', 'ยอดทอ กะ A', 'ยอดทอ กะ B',
            'ความเร็วรอบ กะ A', 'ความเร็วรอบ กะ B', 'ประสิทธิภาพ (กะ A)%', 'ประสิทธิภาพ (กะ B)%',
            'มิเตอร์เริ่มงาน กะ A', 'มิเตอร์เลิกงาน กะ A', 'มิเตอร์เริ่มงาน กะ B', 'มิเตอร์เลิกงาน กะ B',
            'ความยาวตัดม้วน กะ A', 'ความยาวตัดม้วน กะ B',
            'น้ำหนักม้วน กะ A', 'น้ำหนักม้วน กะ B', 'จำนวนแผล กะ A', 'จำนวนแผล กะ B',
            'ค่าเฉลี่ย กะ A', 'ค่าเฉลี่ย กะ B', 'ความยาวตัดม้วน กะ A', 'ความยาวตัดม้วน กะ B',
            'ค่าแรงพนักงานกะ A', 'ค่าแรงพนักงานกะ B'
        ];

        const headerRow = worksheet.addRow(headers);
        headerRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFDDEBF7' }
            };
            cell.font = { bold: true };
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Add extra data (starting row 110)
        this.extraData.forEach((rowData, idx) => {
            const rowNum = 110 + idx;
            const row = worksheet.addRow(this.buildDataRow(rowData, rowNum));

            // Apply borders and alternating colors
            row.eachCell((cell, colNumber) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };

                if (rowNum % 2 === 0) {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFF3F3F3' }
                    };
                }

                // Text columns (left align)
                if ([1, 2, 3, 4, 5, 6].includes(colNumber)) {
                    cell.alignment = { horizontal: 'left', vertical: 'middle' };
                }
                // Numeric columns (right align with number format)
                else if ([7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28].includes(colNumber)) {
                    cell.numFmt = '#,##0';
                    cell.alignment = { horizontal: 'right', vertical: 'middle' };
                }
            });
        });

        // Add extra summary sections if there's extra data
        if (this.extraData.length > 0) {
            this.addExtraSummarySections(worksheet);
        }
    }

    addExtraSummarySections(worksheet) {
        // Find rows for cut round 2 and 3
        const cut2Rows = [];
        const cut3Rows = [];

        this.extraData.forEach((rowData, idx) => {
            const rowNum = 110 + idx;
            const machine = rowData.machine || rowData['เครื่องทอ NO'] || '';
            if (machine.includes('ตัดม้วนครั้งที่ 2')) {
                cut2Rows.push(rowNum);
            } else if (machine.includes('ตัดม้วนครั้งที่ 3')) {
                cut3Rows.push(rowNum);
            }
        });

        // Add summaries for cut round 2 (columns I-J)
        if (cut2Rows.length > 0) {
            const row91 = worksheet.getRow(91);
            row91.getCell(9).value = 'ยอดทอกะ A (ตัดครั้ง 2)';
            row91.getCell(10).value = 'ยอดทอกะ B (ตัดครั้ง 2)';
            row91.getCell(9).font = { underline: true };
            row91.getCell(10).font = { underline: true };
            row91.getCell(9).alignment = { horizontal: 'center', vertical: 'middle' };
            row91.getCell(10).alignment = { horizontal: 'center', vertical: 'middle' };

            const sumFormula2G = this.buildSumFormula('G', cut2Rows);
            const sumFormula2H = this.buildSumFormula('H', cut2Rows);

            const row93 = worksheet.getRow(93);
            row93.getCell(9).value = { formula: sumFormula2G };
            row93.getCell(10).value = { formula: sumFormula2H };
            row93.getCell(9).numFmt = '#,##0';
            row93.getCell(10).numFmt = '#,##0';
            row93.getCell(9).font = { color: { argb: 'FF00008B' } };
            row93.getCell(10).font = { color: { argb: 'FF00008B' } };
            row93.getCell(9).alignment = { horizontal: 'center', vertical: 'middle' };
            row93.getCell(10).alignment = { horizontal: 'center', vertical: 'middle' };
            row93.getCell(9).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            row93.getCell(10).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

            worksheet.mergeCells('I94:J94');
            const row94 = worksheet.getRow(94);
            row94.getCell(9).value = { formula: 'I93+J93' };
            row94.getCell(9).numFmt = '#,##0';
            row94.getCell(9).font = { color: { argb: 'FF00008B' } };
            row94.getCell(9).alignment = { horizontal: 'center', vertical: 'middle' };
            row94.getCell(9).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        }

        // Add summaries for cut round 3 (columns L-M)
        if (cut3Rows.length > 0) {
            const row91 = worksheet.getRow(91);
            row91.getCell(12).value = 'ยอดทอกะ A (ตัดครั้ง 3)';
            row91.getCell(13).value = 'ยอดทอกะ B (ตัดครั้ง 3)';
            row91.getCell(12).font = { underline: true };
            row91.getCell(13).font = { underline: true };
            row91.getCell(12).alignment = { horizontal: 'center', vertical: 'middle' };
            row91.getCell(13).alignment = { horizontal: 'center', vertical: 'middle' };

            const sumFormula3G = this.buildSumFormula('G', cut3Rows);
            const sumFormula3H = this.buildSumFormula('H', cut3Rows);

            const row93 = worksheet.getRow(93);
            row93.getCell(12).value = { formula: sumFormula3G };
            row93.getCell(13).value = { formula: sumFormula3H };
            row93.getCell(12).numFmt = '#,##0';
            row93.getCell(13).numFmt = '#,##0';
            row93.getCell(12).font = { color: { argb: 'FF00008B' } };
            row93.getCell(13).font = { color: { argb: 'FF00008B' } };
            row93.getCell(12).alignment = { horizontal: 'center', vertical: 'middle' };
            row93.getCell(13).alignment = { horizontal: 'center', vertical: 'middle' };
            row93.getCell(12).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            row93.getCell(13).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

            worksheet.mergeCells('L94:M94');
            const row94 = worksheet.getRow(94);
            row94.getCell(12).value = { formula: 'L93+M93' };
            row94.getCell(12).numFmt = '#,##0';
            row94.getCell(12).font = { color: { argb: 'FF00008B' } };
            row94.getCell(12).alignment = { horizontal: 'center', vertical: 'middle' };
            row94.getCell(12).border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        }
    }

    buildSumFormula(col, rows) {
        if (rows.length === 0) return '0';
        const cells = rows.map(r => `${col}${r}`).join(',');
        return `SUM(${cells})`;
    }

    applyFormatting(worksheet) {
        // Add auto filter (A1:AB83 - matching ref.py)
        worksheet.autoFilter = {
            from: { row: 1, column: 1 },
            to: { row: this.MAX_PRIMARY_ROW, column: 28 }
        };

        // Freeze panes (already set in worksheet creation)
    }
}

// Export generator
window.PD2ExcelGenerator = PD2ExcelGenerator;
