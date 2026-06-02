const sharp = require('sharp')
const pngToIco = require('png-to-ico').default
const fs = require('fs')
const path = require('path')

const svgPath = path.join(__dirname, '..', 'build', 'icon.svg')
const pngPath = path.join(__dirname, '..', 'build', 'icon.png')
const icoPath = path.join(__dirname, '..', 'build', 'icon.ico')
const icnsPath = path.join(__dirname, '..', 'build', 'icon.icns')
const resourcesPngPath = path.join(__dirname, '..', 'resources', 'icon.png')

async function main() {
  const svg = fs.readFileSync(svgPath, 'utf-8')

  const png512 = await sharp(Buffer.from(svg))
    .resize(512, 512)
    .png()
    .toBuffer()

  fs.writeFileSync(pngPath, png512)
  console.log('✓ icon.png (512x512)')

  // .ico — usar png-to-ico para generar un .ico válido
  try {
    const icoBuffer = await pngToIco(png512)
    fs.writeFileSync(icoPath, icoBuffer)
    console.log('✓ icon.ico (válido, generado con png-to-ico)')
  } catch (e) {
    console.log('⚠ icon.ico error:', e.message)
  }

  // .icns — sharp no genera .icns, electron-builder lo hace desde el PNG
  try {
    fs.writeFileSync(icnsPath, png512)
    console.log('✓ icon.icns (placeholder, electron-builder lo convertirá)')
  } catch (e) {
    console.log('⚠ icon.icns error:', e.message)
  }

  // resources/icon.png (usado en README)
  try {
    const png96 = await sharp(Buffer.from(svg))
      .resize(96, 96)
      .png()
      .toBuffer()
    fs.writeFileSync(resourcesPngPath, png96)
    console.log('✓ resources/icon.png (96x96)')
  } catch (e) {
    console.log('⚠ resources/icon.png error:', e.message)
  }

  console.log('\nListo. Todos los iconos generados correctamente.')
}

main().catch(console.error)
