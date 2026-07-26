import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ExportPdfOptions {
  elementId: string;
  filename?: string;
  onStart?: () => void;
  onFinish?: () => void;
  onError?: (err: any) => void;
}

export async function exportElementToPdf({
  elementId,
  filename = 'Cuestionario.pdf',
  onStart,
  onFinish,
  onError,
}: ExportPdfOptions): Promise<boolean> {
  onStart?.();

  try {
    const originalElement = document.getElementById(elementId);
    if (!originalElement) {
      throw new Error(`No se encontró el elemento con ID #${elementId}`);
    }

    // Crear un contenedor clonado para renderizar sin restricciones de overflow, scroll o modales
    const cloneContainer = document.createElement('div');
    cloneContainer.style.position = 'absolute';
    cloneContainer.style.top = '0';
    cloneContainer.style.left = '-9999px';
    cloneContainer.style.width = '800px'; // Ancho estándar A4 en px
    cloneContainer.style.backgroundColor = '#ffffff';
    cloneContainer.style.color = '#0f172a';
    cloneContainer.style.padding = '32px';
    cloneContainer.style.boxSizing = 'border-box';
    cloneContainer.style.zIndex = '-99999';
    cloneContainer.style.pointerEvents = 'none';

    // Clonar el contenido e insertarlo
    const clonedContent = originalElement.cloneNode(true) as HTMLElement;
    clonedContent.style.maxHeight = 'none';
    clonedContent.style.height = 'auto';
    clonedContent.style.overflow = 'visible';
    clonedContent.style.width = '100%';

    // Desconectar restricciones de scroll y altura en TODOS los elementos hijos del clon
    clonedContent.querySelectorAll('*').forEach((node) => {
      const el = node as HTMLElement;
      el.style.maxHeight = 'none';
      if (el.style.overflow || el.style.overflowY || el.style.overflowX) {
        el.style.overflow = 'visible';
        el.style.height = 'auto';
      }
    });

    // Remover botones o elementos con la clase no-print si los hay
    clonedContent.querySelectorAll('.no-print, button, select').forEach((btn) => {
      if (!btn.classList.contains('keep-print')) {
        (btn as HTMLElement).style.display = 'none';
      }
    });

    // Asegurar atributo crossOrigin en las imágenes para evitar taintear el canvas
    const imgs = Array.from(clonedContent.querySelectorAll('img'));
    imgs.forEach((img) => {
      img.crossOrigin = 'anonymous';
    });

    cloneContainer.appendChild(clonedContent);
    document.body.appendChild(cloneContainer);

    // Esperar a que las imágenes se hayan cargado por completo
    await Promise.all(
      imgs.map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete) resolve(null);
            else {
              img.onload = () => resolve(null);
              img.onerror = () => resolve(null);
            }
          })
      )
    );

    // Tiempo de estabilización adicional de renderizado
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Capturar con html2canvas (allowTaint: false para permitir canvas.toDataURL)
    const canvas = await html2canvas(cloneContainer, {
      scale: 2, // Calidad retina/HD (300 DPI aprox)
      useCORS: true,
      allowTaint: false,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 800,
    });

    // Remover clon del DOM inmediatamente
    document.body.removeChild(cloneContainer);

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error('La captura del documento resultó vacía.');
    }

    // Configurar PDF en formato A4 (210mm x 297mm)
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = 210; // mm
    const pageHeight = 297; // mm
    const margin = 10; // mm de margen en los 4 bordes
    const printableWidth = pageWidth - margin * 2; // 190 mm
    const printableHeight = pageHeight - margin * 2; // 277 mm

    // Proporciones del canvas a mm en la hoja
    const imgWidthPx = canvas.width;
    const imgHeightPx = canvas.height;

    // Altura equivalente en mm si ajustamos la imagen al ancho imprimible de 190mm
    const totalHeightMm = (imgHeightPx * printableWidth) / imgWidthPx;

    // Pixeles de canvas por cada página A4 de 277mm de alto
    const pxPerPage = Math.floor((printableHeight * imgWidthPx) / printableWidth);

    let renderedHeightPx = 0;
    let pageIndex = 0;

    const ctx = canvas.getContext('2d');

    while (renderedHeightPx < imgHeightPx) {
      if (pageIndex > 0) {
        pdf.addPage();
      }

      // Determinar la altura de este segmento de canvas en px
      const chunkHeightPx = Math.min(pxPerPage, imgHeightPx - renderedHeightPx);

      // Crear canvas auxiliar para esta página
      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = imgWidthPx;
      pageCanvas.height = chunkHeightPx;

      const pageCtx = pageCanvas.getContext('2d');
      if (pageCtx && ctx) {
        pageCtx.fillStyle = '#ffffff';
        pageCtx.fillRect(0, 0, imgWidthPx, chunkHeightPx);

        // Copiar el segmento correspondiente del canvas principal
        pageCtx.drawImage(
          canvas,
          0,
          renderedHeightPx,
          imgWidthPx,
          chunkHeightPx,
          0,
          0,
          imgWidthPx,
          chunkHeightPx
        );
      }

      const pageDataUrl = pageCanvas.toDataURL('image/jpeg', 0.95);
      const chunkHeightMm = (chunkHeightPx * printableWidth) / imgWidthPx;

      // Dibujar la imagen recortada abarcando todo el ancho disponible con márgenes
      pdf.addImage(pageDataUrl, 'JPEG', margin, margin, printableWidth, chunkHeightMm);

      // Pie de página con número de página
      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184); // Slate 400
      pdf.text(
        `Página ${pageIndex + 1} de ${Math.ceil(imgHeightPx / pxPerPage)} • Cuestionario de Requerimientos`,
        margin,
        pageHeight - 4
      );

      renderedHeightPx += chunkHeightPx;
      pageIndex++;
    }

    pdf.save(filename);
    onFinish?.();
    return true;
  } catch (err) {
    console.warn('Error al generar PDF con html2canvas/jsPDF, activando diálogo de impresión:', err);
    onError?.(err);

    // Fallback nativo
    try {
      window.print();
    } catch (e) {
      console.error('Error en window.print:', e);
    }
    onFinish?.();
    return false;
  }
}
