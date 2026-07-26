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
      reader.onloadend = () => resolve((reader.result as string) || url);
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
 * Wrapper con timeout para garantizar que la conversión de imágenes no bloquee el proceso
 */
function convertImageUrlToBase64WithTimeout(url: string, timeoutMs = 2000): Promise<string> {
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

  let outerWrapper: HTMLDivElement | null = null;

  try {
    const originalElement = document.getElementById(elementId);
    if (!originalElement) {
      throw new Error(`No se encontró el elemento a exportar con ID #${elementId}`);
    }

    // 1. Crear un contenedor outer clipped invisible para no parpadear en la pantalla
    outerWrapper = document.createElement('div');
    outerWrapper.style.position = 'fixed';
    outerWrapper.style.top = '0';
    outerWrapper.style.left = '0';
    outerWrapper.style.width = '0';
    outerWrapper.style.height = '0';
    outerWrapper.style.overflow = 'hidden';
    outerWrapper.style.zIndex = '-999999';
    outerWrapper.style.pointerEvents = 'none';

    // 2. Contenedor interno clonado a ancho A4 estándar (800px ~ 190mm a 96dpi)
    const cloneContainer = document.createElement('div');
    cloneContainer.style.position = 'absolute';
    cloneContainer.style.top = '0';
    cloneContainer.style.left = '0';
    cloneContainer.style.width = '800px';
    cloneContainer.style.backgroundColor = '#ffffff';
    cloneContainer.style.color = '#0f172a';
    cloneContainer.style.padding = '24px';
    cloneContainer.style.boxSizing = 'border-box';
    cloneContainer.style.opacity = '1';

    // 3. Clonar el contenido original
    const clonedContent = originalElement.cloneNode(true) as HTMLElement;
    clonedContent.style.maxHeight = 'none';
    clonedContent.style.height = 'auto';
    clonedContent.style.overflow = 'visible';
    clonedContent.style.width = '100%';

    // 4. Convertir textareas e inputs en el clon a bloques de texto estáticos
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

    // 5. Ocultar botones y controles interactivos sin clase keep-print
    clonedContent.querySelectorAll('.no-print, button, select').forEach((node) => {
      if (!node.classList.contains('keep-print')) {
        (node as HTMLElement).style.display = 'none';
      }
    });

    // 6. Remover scroll / overflow en todo el árbol de hijos
    clonedContent.querySelectorAll('*').forEach((node) => {
      const el = node as HTMLElement;
      el.style.maxHeight = 'none';
      if (el.style.overflow || el.style.overflowY || el.style.overflowX) {
        el.style.overflow = 'visible';
        el.style.height = 'auto';
      }
    });

    // 7. Ajustar y fijar colores de SVGs (Lucide icons) para que html2canvas los dibuje sin fallar
    const svgs = Array.from(clonedContent.querySelectorAll('svg'));
    svgs.forEach((svg) => {
      try {
        const computedStyle = window.getComputedStyle(svg);
        const stroke = computedStyle.stroke;
        const fill = computedStyle.fill;
        if (stroke && stroke !== 'none' && stroke !== 'rgba(0, 0, 0, 0)') {
          svg.setAttribute('stroke', stroke);
        }
        if (fill && fill !== 'none' && fill !== 'rgba(0, 0, 0, 0)') {
          svg.setAttribute('fill', fill);
        }
        if (!svg.getAttribute('width')) {
          const w = parseFloat(computedStyle.width) || 18;
          svg.setAttribute('width', `${w}px`);
        }
        if (!svg.getAttribute('height')) {
          const h = parseFloat(computedStyle.height) || 18;
          svg.setAttribute('height', `${h}px`);
        }
      } catch {
        // Ignorar errores de computación si el SVG es dinámico
      }
    });

    // 8. Convertir todas las imágenes a Data URLs (base64)
    const imgs = Array.from(clonedContent.querySelectorAll('img'));
    await Promise.all(
      imgs.map(async (img) => {
        const originalSrc = img.src;
        if (originalSrc) {
          const base64Src = await convertImageUrlToBase64WithTimeout(originalSrc, 2000);
          img.src = base64Src;
        }
        img.removeAttribute('srcset');
        if (
          img.classList.contains('shrink-0') ||
          img.alt?.toLowerCase().includes('logo') ||
          img.className.includes('h-10') ||
          img.className.includes('h-12')
        ) {
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
    outerWrapper.appendChild(cloneContainer);
    document.body.appendChild(outerWrapper);

    // Pequeño delay de reflow
    await new Promise((resolve) => setTimeout(resolve, 200));

    // 9. Renderizar canvas con timeout de seguridad y useCORS: false
    const canvas = await Promise.race([
      html2canvas(cloneContainer, {
        scale: 2,
        useCORS: false, // Las imágenes ya son base64, desactiva la creación de iframes CORS que se cuelgan
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 800,
      }),
      new Promise<HTMLCanvasElement>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout al procesar el lienzo del documento PDF')), 10000)
      ),
    ]);

    // Eliminar el wrapper del DOM
    if (outerWrapper && outerWrapper.parentNode) {
      outerWrapper.parentNode.removeChild(outerWrapper);
      outerWrapper = null;
    }

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error('No se pudo generar la imagen del documento.');
    }

    // 10. Construir el documento A4
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    });

    const pageWidth = 210; // mm
    const pageHeight = 297; // mm
    const margin = 8; // mm
    const printableWidth = pageWidth - margin * 2; // 194 mm
    const printableHeight = pageHeight - margin * 2; // 281 mm

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

      const pageDataUrl = pageCanvas.toDataURL('image/jpeg', 0.94);
      const chunkHeightMm = chunkHeightPx * mmPerPx;

      pdf.addImage(pageDataUrl, 'JPEG', margin, margin, printableWidth, chunkHeightMm);

      pdf.setFontSize(8);
      pdf.setTextColor(148, 163, 184); // Slate 400
      pdf.text(
        `Página ${pageIndex + 1} de ${totalPages} • Documento de Requerimientos de Software`,
        margin,
        pageHeight - 3
      );

      renderedHeightPx += chunkHeightPx;
      pageIndex++;
    }

    // 11. DISPARAR DESCARGA CON MÚLTIPLES MÉTODOS DE FALLBACK
    let downloaded = false;

    // Método A: pdf.save de jsPDF
    try {
      pdf.save(filename);
      downloaded = true;
    } catch (e) {
      console.warn('Fallback: pdf.save falló:', e);
    }

    // Método B: Generación de Blob y click en enlace <a>
    try {
      const pdfBlob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.href = blobUrl;
      downloadAnchor.download = filename;
      downloadAnchor.setAttribute('download', filename);
      downloadAnchor.style.display = 'none';
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloaded = true;

      setTimeout(() => {
        if (downloadAnchor.parentNode) {
          downloadAnchor.parentNode.removeChild(downloadAnchor);
        }
        URL.revokeObjectURL(blobUrl);
      }, 12000);
    } catch (e) {
      console.warn('Fallback: Enlace Blob falló:', e);
    }

    // Método C: Data URI directo si lo anterior falló en navegadores restringidos
    if (!downloaded) {
      try {
        const dataUri = pdf.output('datauristring');
        const downloadAnchor2 = document.createElement('a');
        downloadAnchor2.href = dataUri;
        downloadAnchor2.download = filename;
        downloadAnchor2.setAttribute('download', filename);
        downloadAnchor2.style.display = 'none';
        document.body.appendChild(downloadAnchor2);
        downloadAnchor2.click();

        setTimeout(() => {
          if (downloadAnchor2.parentNode) {
            downloadAnchor2.parentNode.removeChild(downloadAnchor2);
          }
        }, 5000);
      } catch (e) {
        console.warn('Fallback: DataURI falló:', e);
      }
    }

    onFinish?.();
    return true;
  } catch (err: any) {
    console.error('Error durante la exportación a PDF:', err);

    if (outerWrapper && outerWrapper.parentNode) {
      outerWrapper.parentNode.removeChild(outerWrapper);
    }

    onError?.(err);
    onFinish?.();
    return false;
  }
}
