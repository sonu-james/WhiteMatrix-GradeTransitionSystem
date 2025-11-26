// src/utils/exportUtils.js
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import PptxGenJS from "pptxgenjs";

/**
 * Export a table's data as a PDF.
 * @param {Array} rows - data array
 * @param {string} fileName - optional output name
 */
export const exportPDF = (rows, fileName = "grade-table.pdf") => {
  const doc = new jsPDF();
  let y = 10;

  doc.setFontSize(14);
  doc.text("Grade Table", 14, y);
  y += 10;

  rows.forEach((row, i) => {
    const text = Object.values(row).join(" | ");
    doc.text(`${i + 1}. ${text}`, 10, y);
    y += 8;
  });

  doc.save(fileName);
};

/**
 * Export table data as Excel (.xlsx)
 * @param {Array} rows
 * @param {string} fileName
 */
export const exportExcel = (rows, fileName = "grade-table.xlsx") => {
  try {
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Grades");
    XLSX.writeFile(wb, fileName);
  } catch (err) {
    console.error("Excel export failed:", err);
  }
};


export const exportTimelinePDF = async (timelineRef, fileName = "timeline.pdf") => {
  if (!timelineRef?.current) return alert("Timeline ref not found!");

  const element = timelineRef.current;
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: "a4",
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save(fileName);
};


/**
 * Capture the timeline area (via ref) and export as PowerPoint (.pptx)
 */
export const exportTimelinePPT = async (timelineRef, fileName = "timeline-slide.pptx") => {
  if (!timelineRef?.current) return alert("Timeline ref not found!");

  const element = timelineRef.current;
  const canvas = await html2canvas(element, {
    scale: 2,
    backgroundColor: "#ffffff",
    useCORS: true,
  });

  const imgData = canvas.toDataURL("image/png");
  const pptx = new PptxGenJS();
  const slide = pptx.addSlide();

  // Fit image nicely within the slide
  slide.addImage({
    data: imgData,
    x: 0.3,
    y: 0.3,
    w: 9, // width of image on slide
    h: 5, // height of image on slide
  });

  await pptx.writeFile({ fileName });
};