import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// Generate filename with timestamp
function generateFilename(mode, format) {
  const today = new Date().toISOString().split("T")[0];
  const modeLabel = mode === "ana" ? "ana-vefk" : "tanzim-vefk";
  return `${modeLabel}-${today}.${format}`;
}

// Export grid as PNG
export async function exportGridAsPNG(gridElementId, mode) {
  try {
    const gridEl = document.getElementById(gridElementId);
    if (!gridEl) {
      console.error("Grid element not found");
      return;
    }

    const canvas = await html2canvas(gridEl, {
      backgroundColor: "rgba(6,12,32,0.97)",
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = generateFilename(mode, "png");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("PNG export failed:", error);
  }
}

// Export grid as PDF
export async function exportGridAsPDF(gridElementId, mode, title) {
  try {
    const gridEl = document.getElementById(gridElementId);
    if (!gridEl) {
      console.error("Grid element not found");
      return;
    }

    const canvas = await html2canvas(gridEl, {
      backgroundColor: "rgba(6,12,32,0.97)",
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const imgWidth = 180;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const pdf = new jsPDF({
      orientation: imgHeight > imgWidth ? "portrait" : "landscape",
      unit: "mm",
      format: "a4",
    });

    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 10;
    const maxWidth = pageWidth - 2 * margin;
    const maxHeight = pageHeight - 2 * margin;

    let yPos = margin;

    // Add title
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(14);
    pdf.text(title, pageWidth / 2, yPos, { align: "center" });
    yPos += 15;

    // Add timestamp
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    const timestamp = new Date().toLocaleDateString();
    pdf.text(`Generated: ${timestamp}`, pageWidth / 2, yPos, { align: "center" });
    yPos += 10;

    // Add grid image, with page breaks if needed
    let heightRemaining = imgHeight;
    let sourceYPos = 0;

    while (heightRemaining > 0) {
      const canvasHeightForPage = Math.min(heightRemaining, (maxHeight * canvas.height) / imgHeight);
      const canvasSourceHeight = (canvasHeightForPage * canvas.height) / imgHeight;

      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = canvas.width;
      pageCanvas.height = canvasSourceHeight;

      const ctx = pageCanvas.getContext("2d");
      ctx.drawImage(
        canvas,
        0,
        sourceYPos,
        canvas.width,
        canvasSourceHeight,
        0,
        0,
        pageCanvas.width,
        pageCanvas.height
      );

      const pageImgData = pageCanvas.toDataURL("image/png");
      const pageImgHeight = (canvasHeightForPage * maxWidth) / imgWidth;

      pdf.addImage(pageImgData, "PNG", margin, yPos, maxWidth, pageImgHeight);
      yPos += pageImgHeight + 5;

      sourceYPos += canvasSourceHeight;
      heightRemaining -= canvasHeightForPage;

      if (heightRemaining > 0) {
        pdf.addPage();
        yPos = margin;
      }
    }

    pdf.save(generateFilename(mode, "pdf"));
  } catch (error) {
    console.error("PDF export failed:", error);
  }
}