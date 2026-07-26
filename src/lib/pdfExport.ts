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
 * Convierte una cadena OKLCH a RGB/RGBA sRGB exacto.
 * Evita que html2canvas falle con "Attempting to parse an unsupported color function oklch".
 */
function oklchToRgb(oklchStr: string): string {
  try {
    const clean = oklchStr.replace(/oklch\(/i, '').replace(/\)/, '').trim();
    let alpha = 1;
    let partsStr = clean;

    if (clean.includes('/')) {
      const splitSlash = clean.split('/');
      partsStr = splitSlash[0];
      const alphaStr = splitSlash[1].trim();
      alpha = alphaStr.endsWith('%') ? parseFloat(alphaStr) / 100 : parseFloat(alphaStr);
    }

    const parts = partsStr.split(/[\s,]+/).filter(Boolean);
    if (parts.length < 3) return '#334155';

    let l = parseFloat(parts[0]);
    if (parts[0].endsWith('%')) l /= 100;

    let c = parseFloat(parts[1]);
    if (parts[1].endsWith('%')) c /= 100;

    let h = parseFloat(parts[2]);

    if (isNaN(l) || isNaN(c) || isNaN(h)) return '#334155';

    // OKLCH -> OKLAB
    const hRad = (h * Math.PI) / 180;
    const aLab = c * Math.cos(hRad);
    const bLab = c * Math.sin(hRad);

    // OKLAB -> Linear LMS
    const l_ = l + 0.3963377774 * aLab + 0.2158037573 * bLab;
    const m_ = l - 0.1055613458 * aLab - 0.0638541728 * bLab;
    const s_ = l - 0.0894841775 * aLab - 1.291485548 * bLab;

    const l3 = l_ * l_ * l_;
    const m3 = m_ * m_ * m_;
    const s3 = s_ * s_ * s_;

    // LMS -> Linear sRGB
    const rLin = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3;
    const gLin = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3;
    const bLin = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3;

    const toSrgb = (x: number) => {
      x = Math.max(0, Math.min(1, x));
      return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
    };

    const r = Math.round(toSrgb(rLin) * 255);
    const g = Math.round(toSrgb(gLin) * 255);
    const b = Math.round(toSrgb(bLin) * 255);

    if (alpha < 1 && !isNaN(alpha)) {
      return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(2)})`;
    }
    return `rgb(${r}, ${g}, ${b})`;
  } catch {
    return '#334155';
  }
}

/**
 * Reemplaza de forma exhaustiva funciones de color no soportadas por html2canvas
 */
function sanitizeAllCssColors(cssText: string): string {
  if (!cssText) return cssText;
  let result = cssText;
  if (result.includes('oklch')) {
    result = result.replace(/oklch\([^)]+\)/gi, (match) => oklchToRgb(match));
  }
  if (result.includes('oklab')) {
    result = result.replace(/oklab\([^)]+\)/gi, () => '#475569');
  }
  if (result.includes('color-mix')) {
    result = result.replace(/color-mix\([^)]+\)/gi, () => '#475569');
  }
  return result;
}

/**
 * Sanitiza todas las hojas de estilo y atributos de color en el documento para eliminar oklch/oklab
 */
function sanitizeDocumentStyles(doc: Document) {
  // 1. Sanitizar todas las etiquetas <style>
  const styleTags = Array.from(doc.querySelectorAll('style'));
  styleTags.forEach((styleTag) => {
    if (
      styleTag.textContent &&
      (styleTag.textContent.includes('oklch') ||
        styleTag.textContent.includes('oklab') ||
        styleTag.textContent.includes('color-mix'))
    ) {
      styleTag.textContent = sanitizeAllCssColors(styleTag.textContent);
    }
  });

  // 2. Convertir etiquetas <link rel="stylesheet"> con oklch a <style> inline sanitizadas
  const linkTags = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));
  linkTags.forEach((link) => {
    try {
      const sheet = (link as HTMLLinkElement).sheet;
      if (sheet && sheet.cssRules) {
        let cssText = '';
        for (let i = 0; i < sheet.cssRules.length; i++) {
          cssText += sheet.cssRules[i].cssText + '\n';
        }
        if (
          cssText.includes('oklch') ||
          cssText.includes('oklab') ||
          cssText.includes('color-mix')
        ) {
          const sanitized = sanitizeAllCssColors(cssText);
          const newStyle = doc.createElement('style');
          newStyle.textContent = sanitized;
          doc.head.appendChild(newStyle);
          link.remove();
        }
      }
    } catch {
      // Ignorar restricciones CORS de stylesheet externas
    }
  });

  // 3. Sanitizar atributos inline de estilo en todos los elementos
  const allElements = Array.from(doc.querySelectorAll('*'));
  allElements.forEach((node) => {
    const el = node as HTMLElement;
    const styleAttr = el.getAttribute('style');
    if (
      styleAttr &&
      (styleAttr.includes('oklch') ||
        styleAttr.includes('oklab') ||
        styleAttr.includes('color-mix'))
    ) {
      el.setAttribute('style', sanitizeAllCssColors(styleAttr));
    }
  });
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

    // SANITIZAR EL DOCUMENTO PRINCIPAL ANTES DE CLONAR
    sanitizeDocumentStyles(document);

    // 1. Contenedor fuera de pantalla con ancho completo y altura automática sin recortes
    outerWrapper = document.createElement('div');
    outerWrapper.style.position = 'absolute';
    outerWrapper.style.top = '0';
    outerWrapper.style.left = '-9999px';
    outerWrapper.style.width = '800px';
    outerWrapper.style.height = 'auto';
    outerWrapper.style.overflow = 'visible';
    outerWrapper.style.zIndex = '-999999';
    outerWrapper.style.pointerEvents = 'none';

    // 2. Contenedor interno clonado a ancho A4 estándar (800px ~ 190mm a 96dpi)
    const cloneContainer = document.createElement('div');
    cloneContainer.style.position = 'relative';
    cloneContainer.style.width = '800px';
    cloneContainer.style.height = 'auto';
    cloneContainer.style.overflow = 'visible';
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

    // 6. Remover max-height y overflow en TODO el árbol para evitar que se corte el contenido
    const colorPropsToSanitize = [
      'color',
      'backgroundColor',
      'borderColor',
      'borderTopColor',
      'borderBottomColor',
      'borderLeftColor',
      'borderRightColor',
      'outlineColor',
      'fill',
      'stroke',
    ];

    const allClonedNodes = Array.from(clonedContent.querySelectorAll('*'));
    allClonedNodes.push(clonedContent);

    allClonedNodes.forEach((node) => {
      const el = node as HTMLElement;
      const tagName = el.tagName.toLowerCase();

      if (tagName !== 'img' && tagName !== 'svg' && tagName !== 'path') {
        el.style.setProperty('max-height', 'none', 'important');
        el.style.setProperty('overflow', 'visible', 'important');
        el.style.setProperty('overflow-y', 'visible', 'important');
        el.style.setProperty('overflow-x', 'visible', 'important');
      }

      const styleAttr = el.getAttribute('style');
      if (
        styleAttr &&
        (styleAttr.includes('oklch') ||
          styleAttr.includes('oklab') ||
          styleAttr.includes('color-mix'))
      ) {
        el.setAttribute('style', sanitizeAllCssColors(styleAttr));
      }

      try {
        const computed = window.getComputedStyle(el);
        colorPropsToSanitize.forEach((prop) => {
          const val = computed.getPropertyValue(prop);
          if (
            val &&
            (val.includes('oklch') || val.includes('oklab') || val.includes('color-mix'))
          ) {
            const cleanVal = sanitizeAllCssColors(val);
            el.style.setProperty(prop, cleanVal, 'important');
          }
        });
      } catch {
        // ignore
      }
    });

    // 7. Ajustar y fijar colores de SVGs (Lucide icons)
    const svgs = Array.from(clonedContent.querySelectorAll('svg'));
    svgs.forEach((svg) => {
      try {
        const computedStyle = window.getComputedStyle(svg);
        const stroke = computedStyle.stroke;
        const fill = computedStyle.fill;
        if (stroke && stroke !== 'none' && stroke !== 'rgba(0, 0, 0, 0)') {
          svg.setAttribute('stroke', sanitizeAllCssColors(stroke));
        }
        if (fill && fill !== 'none' && fill !== 'rgba(0, 0, 0, 0)') {
          svg.setAttribute('fill', sanitizeAllCssColors(fill));
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
        // ignore
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

    // Esperar reflujo para renderizado completo de fuentes e imágenes
    await new Promise((resolve) => setTimeout(resolve, 350));

    // Calcular la altura real completa del contenido desplegado
    const targetWidth = 800;
    const targetHeight = Math.max(
      cloneContainer.scrollHeight,
      cloneContainer.offsetHeight,
      clonedContent.scrollHeight,
      clonedContent.offsetHeight,
      1200
    );

    // 9. Renderizar canvas completo con html2canvas especificando alto exacto
    const canvas = await Promise.race([
      html2canvas(cloneContainer, {
        scale: 2,
        useCORS: false,
        allowTaint: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: targetWidth,
        height: targetHeight,
        windowWidth: targetWidth,
        windowHeight: targetHeight + 200,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          sanitizeDocumentStyles(clonedDoc);
        },
      }),
      new Promise<HTMLCanvasElement>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout al procesar el lienzo del documento PDF')), 15000)
      ),
    ]);

    if (outerWrapper && outerWrapper.parentNode) {
      outerWrapper.parentNode.removeChild(outerWrapper);
      outerWrapper = null;
    }

    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error('No se pudo generar la imagen del documento.');
    }

    // 10. Construir el documento PDF A4 multi-página sin cortes
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

    // 11. DISPARAR DESCARGA (ÚNICA DESCARGA CON FALLBACKS DE SEGURIDAD)
    let downloaded = false;

    // Método A: pdf.save de jsPDF (método principal)
    try {
      pdf.save(filename);
      downloaded = true;
    } catch (e) {
      console.warn('Fallback: pdf.save falló:', e);
    }

    // Método B: Enlace Blob si pdf.save no funcionó
    if (!downloaded) {
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
    }

    // Método C: DataURI si los anteriores no funcionaron
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
