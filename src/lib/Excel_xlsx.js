import ExcelJS from 'exceljs';

export async function exportTableToXlsx(filename = '', reportTitle = '') {
  const tableID = 'ReportData';
  const ReportTitle = 'ReportTitle';
  const ReportInputs = 'ReportInputs';

  const tableSelect = document.getElementById(tableID);
  if (!tableSelect) {
    console.error("Table not found with ID:", tableID);
    return;
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Report');

  let rowIndex = 2; 

  // REPORT TITLE : START
  const reportTitleElement = document.getElementById(ReportTitle);
  if (reportTitleElement && reportTitleElement.innerText.trim()) {
    const titleRow = worksheet.addRow([reportTitleElement.innerText.trim()]);
    // worksheet.mergeCells(`A${titleRow.number}:G${titleRow.number}`); // No need to merge
    titleRow.font = { bold: true, size: 12 };
    rowIndex++;
  }
  // REPORT TITLE : END


  // REPORT INPUT : START
  const reportInputsElement = document.getElementById(ReportInputs);
  if (reportInputsElement && reportInputsElement.innerText.trim()) {
    const inputsRow = worksheet.addRow([reportInputsElement.innerText.trim()]);
    // worksheet.mergeCells(`A${inputsRow.number}:G${inputsRow.number}`); // No need to merge
    inputsRow.font = { italic: true };
    rowIndex++;
  }
  // REPORT INPUT : END

  worksheet.addRow([]);
  rowIndex++;

  // TABLE HEADER : START
  const headerRows = tableSelect.querySelectorAll("thead tr");
  let headers = [];

  headerRows.forEach(row => {
    headers = [];
    const headerCells = row.querySelectorAll("th");
    
    headerCells.forEach(th => headers.push(th.innerText.trim()));

    if (headers.length > 0) {
      const headerRow = worksheet.addRow(headers);
      headerRow.eachCell(cell => {
        cell.font = { bold: true, size: 12 };
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'D8BFD8' } // Light purple background
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
      });

      rowIndex++;
    }
  });
  // TABLE HEADER : END

  // TABLE DATA : START
  const dataStartRow = rowIndex;
  const tableData = [];
  const mergeCells = [];
  const rowSkipMap = new Map();

  const bodyRows = tableSelect.querySelectorAll("tbody tr");
  bodyRows.forEach((row, rowIdx) => {
    let rowData = [];
    let cellIndex = 0;
    const cells = row.querySelectorAll("td");
    
    cells.forEach(cell => {
      while (rowSkipMap.has(`${rowIdx},${cellIndex}`)) {
        rowData.push("");
        cellIndex++;
      }
      
      let cellValue = cell.innerText.trim();
      let cleanedValue = cellValue.replace(/,/g, '');
      let formattedValue = !isNaN(Number(cleanedValue)) && cleanedValue !== "" ? Number(cleanedValue) : cellValue;
      rowData.push(formattedValue);

      const rowspan = parseInt(cell.getAttribute("rowspan")) || 1;
      const colspan = parseInt(cell.getAttribute("colspan")) || 1;
      
      if (rowspan > 1 || colspan > 1) {
        mergeCells.push({
          s: { r: dataStartRow + rowIdx, c: cellIndex + 1 },
          e: { r: dataStartRow + rowIdx + rowspan - 1, c: cellIndex + colspan }
        });
        
        for (let r = 0; r < rowspan; r++) {
          for (let c = 0; c < colspan; c++) {
            if (r === 0 && c === 0) continue;
            rowSkipMap.set(`${rowIdx + r},${cellIndex + c}`, true);
          }
        }
      }
      cellIndex += colspan;
    });
    tableData.push(rowData);
  });

  tableData.forEach(rowData => {
    const newRow = worksheet.addRow(rowData);
    newRow.eachCell(cell => {
      cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    });
  });

  mergeCells.forEach(range => {
    worksheet.mergeCells(range.s.r, range.s.c, range.e.r, range.e.c);
    const mergedCell = worksheet.getCell(range.s.r, range.s.c);
    mergedCell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
  });

  // FOOTER : START
  const footerRows = tableSelect.querySelectorAll("tfoot tr");
  if (footerRows.length > 0) {
    worksheet.addRow([]);
    rowIndex++;
    footerRows.forEach(rowElem => {
      let rowData = [];
      const cells = rowElem.querySelectorAll("td");
      cells.forEach(cell => {
          let cellValue = cell.innerText.trim();
          let cleanedValue = cellValue.replace(/,/g, ''); // Remove commas
          let formattedValue = !isNaN(Number(cleanedValue)) && cleanedValue !== "" ? Number(cleanedValue) : cellValue;
          rowData.push(formattedValue);
      });
      const addedRow = worksheet.addRow(rowData);
      addedRow.eachCell(cell => {
        cell.font = { bold: true, size: 11 };
        cell.alignment = { horizontal: "center", vertical: 'middle', wrapText: true };
      });
      rowIndex++;
    });
  }
  // FOOTER : END


  const numCols = headers.length;
  let colWidths = [];
  for (let i = 0; i < numCols; i++) {
    let maxLen = headers[i] ? headers[i].length : 10;
    tableData.forEach(row => {
      if (row[i] && row[i].length > maxLen) {
        maxLen = row[i].length;
      }
    });
    footerRows.forEach(rowElem => {
      const cells = rowElem.querySelectorAll("td");
      if (cells[i] && cells[i].innerText.trim().length > maxLen) {
        maxLen = cells[i].innerText.trim().length;
      }
    });
    colWidths.push({ width: maxLen + 5 });
  }
  worksheet.columns = colWidths;

  // WORKBOOK DOWNLOAD : START
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob(
    [buffer],
    { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
  );
  const url = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");
  downloadLink.href = url;
  downloadLink.download = filename.trim() ? filename.trim() + '.xlsx' : 'Report.xlsx';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}
  // WORKBOOK DOWNLOAD : END
