const sharp = require('sharp')
const fs = require('fs')
const path = require('path')

const svgPath = path.join(__dirname, '..', 'build', 'icon.svg')
const pngPath = path.join(__dirname, '..', 'build', 'icon.png')
const icoPath = path.join(__dirname, '..', 'build', 'icon.ico')
const icnsPath = path.join(__dirname, '..', 'build', 'icon.icns')

async function main() {
  const svg = fs.readFileSync(svgPath, 'utf-8')

  const png512 = await sharp(Buffer.from(svg))
    .resize(512, 512)
    .png()
    .toBuffer()

  fs.writeFileSync(pngPath, png512)
  console.log('✓ icon.png (512x512)')

  // .ico — sharp no genera .ico directamente,
  // así que usamos el PNG como base para electron-builder.
  // Para el .ico, copiamos el PNG ya que electron-builder
  // normalmente lo genera automáticamente desde el PNG.
  // Pero dejamos también el PNG como fallback.
  try {
    fs.writeFileSync(icoPath, png512)
    console.log('✓ icon.ico (copiado de PNG, electron-builder lo convertirá correctamente)')
  } catch (e) {
    console.log('⚠ icon.ico no se pudo copiar:', e.message)
  }

  // .icns — igual, electron-builder lo genera desde el PNG
  try {
    fs.writeFileSync(icnsPath, png512)
    console.log('✓ icon.icns (placeholder para electron-builder)')
  } catch (e) {
    console.log('⚠ icon.icns no se pudo copiar:', e.message)
  }

  console.log('\nListo. Ejecuta "npm run build" para que electron-builder genere los .ico/.icns correctos.')
}

main().catch(console.error)
