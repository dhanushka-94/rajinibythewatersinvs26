import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generate and download PDF from HTML element
 * Optimized for A4 size (210mm x 297mm) with 2cm margins on all sides
 */
export async function generatePDF(
  elementId: string,
  filename: string = 'invoice.pdf'
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found`);
  }

  try {
    // Store original styles
    const originalStyles = {
      display: element.style.display,
      overflow: element.style.overflow,
      width: element.style.width,
      margin: element.style.margin,
      padding: element.style.padding,
    };
    
    const originalClassName = element.className;
    
    // Apply PDF-optimized styles - no borders, proper sizing
    element.style.display = 'block';
    element.style.overflow = 'visible';
    element.style.width = '210mm'; // A4 width
    element.style.minHeight = '297mm';
    element.style.margin = '0';
    element.style.padding = '0'; // No padding, margins handled by PDF
    element.style.border = 'none';
    element.style.boxShadow = 'none';
    element.style.position = 'relative';
    element.style.visibility = 'visible';
    element.style.opacity = '1';
    element.className = originalClassName;
    
    // Wait for styles and fonts to apply
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Force a reflow to ensure all styles are applied
    void element.offsetHeight;
    
    // Wait for all images to load
    const images = element.getElementsByTagName('img');
    const imagePromises = Array.from(images).map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = resolve; // Continue even if image fails
        setTimeout(resolve, 2000); // Timeout after 2 seconds
      });
    });
    await Promise.all(imagePromises);
    
    // Additional wait for any remaining async rendering
    await new Promise(resolve => setTimeout(resolve, 500));

    // A4 dimensions in mm with 1cm (10mm) margins on all sides
    const a4Width = 210;
    const a4Height = 297;
    const margin = 10; // 1cm = 10mm margin on all sides
    const contentWidth = a4Width - (margin * 2); // 190mm
    const contentHeight = a4Height - (margin * 2); // 277mm
    
    // Create canvas from HTML element with optimized settings
    const canvas = await html2canvas(element, {
      scale: 2, // High quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      width: element.scrollWidth || element.offsetWidth,
      height: element.scrollHeight || element.offsetHeight,
      windowWidth: element.scrollWidth || element.offsetWidth,
      windowHeight: element.scrollHeight || element.offsetHeight,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
      allowTaint: false,
      removeContainer: false,
      ignoreElements: (element) => {
        // Ignore elements that might cause issues
        return element.classList?.contains('print:hidden') || false;
      },
      onclone: (clonedDoc) => {
        // Ensure all styles are preserved in the cloned document
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.width = '210mm';
          clonedElement.style.minHeight = '297mm';
          clonedElement.style.backgroundColor = 'white';
          clonedElement.style.visibility = 'visible';
          clonedElement.style.opacity = '1';
          clonedElement.style.position = 'relative';
          clonedElement.style.display = 'block';
        }
        
        // Ensure all images in cloned document are visible
        const clonedImages = clonedDoc.getElementsByTagName('img');
        Array.from(clonedImages).forEach((img: HTMLImageElement) => {
          img.style.display = 'block';
          img.style.visibility = 'visible';
          img.style.opacity = '1';
        });
      },
    });

    // Calculate dimensions to fit A4 with 2cm margins
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * contentWidth) / canvas.width;

    // Create PDF with A4 format
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    // Calculate dimensions
    const pageHeight = contentHeight; // Available height per page (277mm)
    const totalHeight = imgHeight; // Total height of content in mm
    const totalPages = Math.ceil(totalHeight / pageHeight);

    // Process each page
    for (let page = 0; page < totalPages; page++) {
      if (page > 0) {
        pdf.addPage();
      }

      // Calculate the portion of canvas for this page
      const sourceY = (page * pageHeight / totalHeight) * canvas.height;
      const sourceHeight = Math.min(
        (pageHeight / totalHeight) * canvas.height,
        canvas.height - sourceY
      );

      // Create a canvas for this page's content
      const pageCanvas = document.createElement('canvas');
      const scale = canvas.width / imgWidth; // Scale factor
      pageCanvas.width = canvas.width;
      pageCanvas.height = sourceHeight;
      
      const pageCtx = pageCanvas.getContext('2d');
      if (!pageCtx) {
        throw new Error('Failed to get canvas context');
      }

      // Draw the portion of the original canvas for this page
      pageCtx.drawImage(
        canvas,
        0, sourceY, // Source X, Y
        canvas.width, sourceHeight, // Source width, height
        0, 0, // Destination X, Y
        canvas.width, sourceHeight // Destination width, height
      );

      // Convert page canvas to image
      const pageImgData = pageCanvas.toDataURL('image/png', 1.0);
      
      // Calculate display dimensions for this page
      const displayHeight = Math.min(pageHeight, totalHeight - (page * pageHeight));

      // Add to PDF
      pdf.addImage(
        pageImgData,
        'PNG',
        margin, // X position
        margin, // Y position (start from top margin)
        imgWidth, // Width
        displayHeight // Height for this page
      );

      // Add page number at the bottom center
      const pageNumber = page + 1;
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      pdf.text(
        `Page ${pageNumber} of ${totalPages}`,
        a4Width / 2, // Center horizontally
        a4Height - 5, // 5mm from bottom
        { align: 'center' }
      );
    }

    // Restore original styles
    element.style.display = originalStyles.display;
    element.style.overflow = originalStyles.overflow;
    element.style.width = originalStyles.width;
    element.style.margin = originalStyles.margin;
    element.style.padding = originalStyles.padding;
    element.className = originalClassName;

    // Download PDF
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
}
