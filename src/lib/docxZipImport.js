import JSZip from 'jszip'

// Extrae el texto de cada párrafo de un .docx (que en realidad es un .zip
// con word/document.xml adentro). Filtra los encabezados tipo
// "Reto - Nivel 1" / "(Modo presencial)" que no son cartas reales.
async function extractParagraphs(docxArrayBuffer) {
  const zip = await JSZip.loadAsync(docxArrayBuffer)
  const xmlFile = zip.file('word/document.xml')
  if (!xmlFile) return []
  const xmlText = await xmlFile.async('text')
  const doc = new DOMParser().parseFromString(xmlText, 'application/xml')
  const paragraphs = Array.from(doc.getElementsByTagName('w:p'))
  const lines = []
  for (const p of paragraphs) {
    const runs = Array.from(p.getElementsByTagName('w:t'))
    const text = runs
      .map((t) => t.textContent)
      .join('')
      .trim()
    if (!text) continue
    if (/^Reto\s*-\s*Nivel/i.test(text)) continue
    if (/^Verdad\s*-\s*Nivel/i.test(text)) continue
    if (/^\(Modo/i.test(text)) continue
    lines.push(text)
  }
  return lines
}

// "Reto - Nivel 2 (Modo a Distancia).docx" -> { type:'dare', level:2, modality:'distancia' }
// "Verdad - Nivel 3.docx"                  -> { type:'truth', level:3, modality:'ambas' }
function parseFilename(filename) {
  const base = filename.replace(/\.docx$/i, '')
  const isDare = /^Reto/i.test(base)
  const isTruth = /^Verdad/i.test(base)
  if (!isDare && !isTruth) return null

  const levelMatch = base.match(/Nivel\s*(\d+)/i)
  if (!levelMatch) return null
  const level = Number(levelMatch[1])
  if (level < 1 || level > 4) return null

  let modality = 'ambas'
  if (isDare) {
    if (/distancia/i.test(base)) modality = 'distancia'
    else if (/presencial/i.test(base)) modality = 'presencial'
    else return null // reto sin modalidad reconocida en el nombre: no sabemos dónde clasificarlo
  }

  return { type: isDare ? 'dare' : 'truth', level, modality }
}

function guessTimer(text) {
  const minMatch = text.match(/(\d+)\s*minutos?/i)
  if (minMatch) return Number(minMatch[1]) * 60
  const secMatch = text.match(/(\d+)\s*segundos?/i)
  if (secMatch) return Number(secMatch[1])
  return 30
}

// Lee un .zip subido con archivos .docx adentro (mismo formato que ya usás)
// y devuelve la lista de cartas lista para previsualizar/insertar.
// También devuelve una lista de archivos que no se pudieron clasificar, para avisar.
export async function parseCardsZip(zipFile) {
  const zip = await JSZip.loadAsync(zipFile)
  const cards = []
  const skipped = []

  const entries = Object.values(zip.files).filter((f) => !f.dir && /\.docx$/i.test(f.name))

  for (const entry of entries) {
    const shortName = entry.name.split('/').pop()
    const meta = parseFilename(shortName)
    if (!meta) {
      skipped.push(shortName)
      continue
    }
    const buffer = await entry.async('arraybuffer')
    const lines = await extractParagraphs(buffer)
    for (const text of lines) {
      cards.push({
        type: meta.type,
        level: meta.level,
        modality: meta.modality,
        groupMode: 'ambas',
        text,
        timerSeconds: meta.type === 'dare' ? guessTimer(text) : null,
      })
    }
  }

  return { cards, skipped }
}
