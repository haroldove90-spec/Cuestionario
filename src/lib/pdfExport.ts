import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface ExportPdfOptions {
  elementId: string;
  filename?: string;
  onStart?: () => void;
  onFinish?: () => void;
  onError?: (err: any) => void;
}

/**
 * Convierte una URL de imagen a un DataURL en base64 usando canvas o fetch
 * para evitar problemas de CORS y 'tainted canvas' en html2canvas.
 */
async function convertImageUrlToBase64(url: string): Promise<string> {
  if (!url) return url;
  if (url.startsWith('data:')) return url;

  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error('Fetch status error');
    const blob = await response.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string || url);
      reader.onerror = () => resolve(url);
      reader.readAsDataURL(blob);
    });
  } catch {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width || 120;
          canvas.height = img.naturalHeight || img.height || 120;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          } else {
            resolve(url);
          }
        } catch {
          resolve(url);
        }
      };
      img.onerror = () => resolve(url);
      img.src = url;
    });
  }
}

/**
 * Wrapper con timeout para garantizar que la conversión de imágenes nunca congele la exportación
 */
function convertImageUrlToBase64WithTimeout(url: string, timeoutMs = 2500): Promise<string> {
  return new Promise((resolve) => {
    let resolved = false;
    const timer = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(url);
      }
    }, timeoutMs);

    convertImageUrlToBase64(url)
      .then((res) => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          resolve(res);
        }
      })
      .catch(() => {
        if (!resolved) {
          resolved = true;
          clearTimeout(timer);
          resolve(url);
        }
      });
  });
}

export async function exportElementToPdf({
  elementId,
  filename = 'Cuestionario.pdf',
  onStart,
  onFinish,
  onError,
}: ExportPdfOptions): Promise<boolean> {
  onStart?.();

  let cloneContainer: HTMLDivElement | null = null;

  try {
    const originalElement = document.getElementById(elementId);
    if (!originalElement) {
      throw new Error(`No se encontró el elemento a exportar con ID #${elementId}`);
    }

    // 1. Crear contenedor de clonación fuera de pantalla, con opacidad 1 (vital para html2canvas)
    cloneContainer = document.createElement('div');
    cloneContainer.style.position = 'fixed';
    cloneContainer.style.top = '0';
    cloneContainer.style.left = '-9999px'; // Posicionado fuera del área visible
    cloneContainer.style.width = '800px'; // Ancho A4 estandarizado (~190mm a 96DPI)
    cloneContainer.style.backgroundColor = '#ffffff';
    cloneContainer.style.color = '#0f172a';
    cloneContainer.style.padding = '24px';
    cloneContainer.style.boxSizing = 'border-box';
    cloneContainer.style.zIndex = '-999999';
    cloneContainer.style.opacity = '1'; // IMPORTANTE: Opacidad 1.0 para que html2canvas dibuje todos los colores y textos
    cloneContainer.style.pointerEvents = 'none';

    // 2. Clonar el elemento
    const clonedContent = originalElement.cloneNode(true) as HTMLElement;
    clonedContent.style.maxHeight = 'none';
    clonedContent.style.height = 'auto';
    clonedContent.style.overflow = 'visible';
    clonedContent.style.width = '100%';

    // 3. Reemplazar textareas e inputs en el clon por divs estáticos con su texto completo
    const textareas = Array.from(clonedContent.querySelectorAll('textarea'));
    textareas.forEach((ta) => {
      const val = (ta as HTMLTextAreaElement).value || ta.textContent || '';
      const div = document.createElement('div');
      div.className = 'p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono whitespace-pre-wrap leading-relaxed text-slate-800';
      div.textContent = val || 'Sin contenido especificado';
      ta.parentNode?.replaceChild(div, ta);
    });

    const inputs = Array.from(clonedContent.querySelectorAll('input[type="text"], input[type="email"]'));
    inputs.forEach((inp) => {
      const val = (inp as HTMLInputElement).value || '';
      const span = document.createElement('span');
      span.className = 'font-bold text-slate-900 text-xs';
      span.textContent = val || '-';
      inp.parentNode?.replaceChild(span, inp);
    });

    // 4. Quitar botones, selects interactivos y elementos no imprimibles
    clonedContent.querySelectorAll('.no-print, button, select').forEach((node) => {
      if (!node.classList.contains('keep-print')) {
        (node as HTMLElement).style.display = 'none';
      }
    });

    // 5. Eliminar restricciones de scroll y overflow en todos los descendientes
    clonedContent.querySelectorAll('*').forEach((node) => {
      const el = node as HTMLElement;
      el.style.maxHeight = 'none';
      if (el.style.overflow || el.style.overflowY || el.style.overflowX) {
        el.style.overflow = 'visible';
        el.style.height = 'auto';
      }
    });

    // 6. Procesar y restringir tamaño de TODAS las imágenes con timeout de protección
    const imgs = Array.from(clonedContent.querySelectorAll('img'));
    await Promise.all(
      imgs.map(async (img) => {
        const originalSrc = img.src;
        if (originalSrc) {
          const base64Src = await convertImageUrlToBase64WithTimeout(originalSrc, 2500);
          img.src = base64Src;
        }
        img.removeAttribute('srcset');
        if (img.classList.contains('shrink-0') || img.alt?.toLowerCase().includes('logo') || img.className.includes('h-10') || img.className.includes('h-12')) {
          img.style.maxHeight = '48px';
          img.style.height = '44px';
          img.style.width = 'auto';
          img.style.objectFit = 'contain';
        } else {
          img.style.maxHeight = '250px';
          img.style.objectFit = 'contain';
        }
      })
    );

    cloneContainer.appendChild(clonedContent);
    document.body.appendChild(cloneContainer);

    // Pequeña pausa para reflow del navegador
    await new Promise((resolve) => setTimeout(resolve, 250));

    // 7. Capturar el contenedor usando html2canvas
    const canvas = await html2canvas(cloneContainer, {
      scale: 2, // Calidad alta (300 DPI aprox)
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 800,
    });

    // Remover el contenedor clon del DOM
    if (cloneContainer && cloneContainer.parentNode) {
      cloneContainer.parentNode.removeChild(cloneContainer);
      cloneContainer = null;
    }

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error('No se pudo renderizar la captura del documento.');
    }

    // 8. Crear PDF A4 (210mm x 297mm) con jsPDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = 210; // mm
    const pageHeight = 297; // mm
    const margin = 10; // mm
    const printableWidth = pageWidth - margin * 2; // 190 mm
    const printableHeight = pageHeight - margin * 2; // 277 mm

    const imgWidthPx = canvas.width;
    const imgHeightPx = canvas.height;

    const mmPerPx = printableWidth / imgWidthPx;
    const pxPerPage = Math.floor(printableHeight / mmPerPx);

    let renderedHeightPx = 0;
    let pageIndex = 0;
    const totalPages = Math.ceil(imgHeightPx / pxPerPage) || 1;

    const ctx = canvas.getContext('2d');

    while (renderedHeightPx < imgHeightPx) {
      if (pageIndex > 0) {
        pdf.addPage();
      }

      const chunkHeightPx = Math.min(pxPerPage, imgHeightPx - renderedHeightPx);

      const pageCanvas = document.createElement('canvas');
      pageCanvas.width = imgWidthPx;
      pageCanvas.height = chunkHeightPx;

      const pageCtx = pageCanvas.getContext('2d');
      if (pageCtx && ctx) {
        pageCtx.fillStyle = '#ffffff';
        pageCtx.fillRect(0, 0, imgWidthPx, chunkHeightPx);
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

      const pageDataUrl = pageCanvas.toDataURL('image/jpeg', 0.92);
      const chunkHeightMm = chunkHeightPx * mmPerPx;

      pdf.addImage(pageDataUrl, 'JPEG', margin, margin, printableWidth, chunkHeightMm);

      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184); // Slate 400
      pdf.text(
        `Página ${pageIndex + 1} de ${totalPages} • Cuestionario de Requerimientos de Software`,
        margin,
        pageHeight - 4
      );

      renderedHeightPx += chunkHeightPx;
      pageIndex++;
    }

    // 9. DESCARGA DIRECTA DEL ARCHIVO PDF AL DISPOSITIVO (BLOB + LINK DOWNLOAD + SAVE FALLBACK)
    const pdfBlob = pdf.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);

    const downloadLink = document.createElement('a');
    downloadLink.href = blobUrl;
    downloadLink.download = filename;
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();

    try {
      pdf.save(filename);
    } catch (saveErr) {
      console.warn('Ejecutado fallback de descarga para PDF:', saveErr);
    }

    setTimeout(() => {
      if (downloadLink.parentNode) {
        downloadLink.parentNode.removeChild(downloadLink);
      }
      URL.revokeObjectURL(blobUrl);
    }, 15000);

    onFinish?.();
    return true;
  } catch (err: any) {
    console.error('Error durante la generación y descarga del PDF:', err);

    if (cloneContainer && cloneContainer.parentNode) {
      cloneContainer.parentNode.removeChild(cloneContainer);
    }

    onError?.(err);
    onFinish?.();
    return false;
  }
}
