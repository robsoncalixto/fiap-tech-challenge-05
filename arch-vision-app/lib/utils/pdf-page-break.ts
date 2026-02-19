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
