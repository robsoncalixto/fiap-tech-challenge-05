import type { jsPDF } from 'jspdf'

const HEADER_HEIGHT_MM = 12
const HEADER_SEPARATOR_GAP = 2

export interface PdfHeaderOptions {
  logoDataUrl: string
  generatedAt: string
  totalPages: number
}

export function drawPageHeader(
  pdf: jsPDF,
  pageIndex: number,
  margin: number,
  pageWidth: number,
  opts: PdfHeaderOptions,
) {
  const logoHeight = 6
  const logoWidth = logoHeight * 5 // logo aspect ratio ~5:1
  const headerY = margin

  pdf.addImage(opts.logoDataUrl, 'PNG', margin, headerY, logoWidth, logoHeight)

  pdf.setFontSize(8)
  pdf.setTextColor(120, 120, 120)

  const dateText = opts.generatedAt
  const pageText = `${pageIndex + 1} / ${opts.totalPages}`

  const dateWidth = pdf.getTextWidth(dateText)
  const pageWidth_ = pdf.getTextWidth(pageText)

  const textY = headerY + logoHeight - 0.5
  pdf.text(dateText, pageWidth - margin - dateWidth - pageWidth_ - 8, textY)
  pdf.text(pageText, pageWidth - margin - pageWidth_, textY)

  const lineY = headerY + logoHeight + HEADER_SEPARATOR_GAP
  pdf.setDrawColor(210, 210, 210)
  pdf.setLineWidth(0.3)
  pdf.line(margin, lineY, pageWidth - margin, lineY)
}

export function getContentStartY(margin: number): number {
  return margin + HEADER_HEIGHT_MM
}

export function getContentHeightMm(pageHeight: number, margin: number): number {
  return pageHeight - margin - getContentStartY(margin)
}

export function loadLogoAsDataUrl(logoUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth || 280
      canvas.height = img.naturalHeight || 56
      const ctx = canvas.getContext('2d')
      if (!ctx) { reject(new Error('Canvas context unavailable')); return }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => reject(new Error('Failed to load logo'))
    img.src = logoUrl
  })
}

export interface BlockPosition {
  tag: string
  offsetTop: number
  offsetHeight: number
}

export interface PageSlice {
  startY: number
  endY: number
}

const BLOCK_SELECTORS = 'h1, h2, h3, h4, h5, h6, p, ul, ol, table, pre, blockquote, hr'
const HEADING_TAGS = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6'])

export function collectBlockPositions(container: HTMLElement): BlockPosition[] {
  const prose = container.querySelector('.prose')
  if (!prose) return []

  const elements = prose.querySelectorAll(BLOCK_SELECTORS)
  const containerTop = container.offsetTop
  const blocks: BlockPosition[] = []

  for (const el of elements) {
    const htmlEl = el as HTMLElement
    blocks.push({
      tag: el.tagName,
      offsetTop: htmlEl.offsetTop - containerTop,
      offsetHeight: htmlEl.offsetHeight,
    })
  }

  return blocks
}

export function calculatePageSlices(
  blocks: BlockPosition[],
  canvasHeight: number,
  pageHeightPx: number,
  scale: number,
): PageSlice[] {
  if (canvasHeight <= pageHeightPx) {
    return [{ startY: 0, endY: canvasHeight }]
  }

  const safeCutPoints = blocks.map(b => Math.round(b.offsetTop * scale))

  const slices: PageSlice[] = []
  let currentStart = 0

  while (currentStart < canvasHeight) {
    const pageBottom = currentStart + pageHeightPx

    if (pageBottom >= canvasHeight) {
      slices.push({ startY: currentStart, endY: canvasHeight })
      break
    }

    let bestCut = -1
    let bestCutIndex = -1
    for (let i = 0; i < safeCutPoints.length; i++) {
      const cutY = safeCutPoints[i]
      if (cutY > currentStart && cutY <= pageBottom) {
        bestCut = cutY
        bestCutIndex = i
      }
    }

    if (bestCut <= currentStart) {
      slices.push({ startY: currentStart, endY: pageBottom })
      currentStart = pageBottom
      continue
    }

    // Heading orphan protection: if the block at bestCutIndex-1 is a heading
    // (meaning the heading would be the last thing on this page), move the
    // cut above the heading so it starts on the next page.
    if (bestCutIndex > 0) {
      const prevBlock = blocks[bestCutIndex - 1]
      if (HEADING_TAGS.has(prevBlock.tag)) {
        const headingCut = Math.round(prevBlock.offsetTop * scale)
        if (headingCut > currentStart) {
          bestCut = headingCut
        }
      }
    }

    slices.push({ startY: currentStart, endY: bestCut })
    currentStart = bestCut
  }

  return slices
}

export function sliceCanvasToPages(
  sourceCanvas: HTMLCanvasElement,
  slices: PageSlice[],
  contentWidthMm: number,
): { imgData: string; heightMm: number }[] {
  const pages: { imgData: string; heightMm: number }[] = []
  const tmpCanvas = document.createElement('canvas')
  const ctx = tmpCanvas.getContext('2d')
  if (!ctx) return pages

  const canvasWidth = sourceCanvas.width

  for (const slice of slices) {
    const sliceHeight = slice.endY - slice.startY
    if (sliceHeight <= 0) continue

    tmpCanvas.width = canvasWidth
    tmpCanvas.height = sliceHeight

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvasWidth, sliceHeight)

    ctx.drawImage(
      sourceCanvas,
      0, slice.startY, canvasWidth, sliceHeight,
      0, 0, canvasWidth, sliceHeight,
    )

    const imgData = tmpCanvas.toDataURL('image/jpeg', 0.95)
    const heightMm = (sliceHeight / canvasWidth) * contentWidthMm

    pages.push({ imgData, heightMm })
  }

  return pages
}
