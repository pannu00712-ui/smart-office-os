// Removes the "crossorigin" attribute that Vite adds to <script>/<link> tags.
// In Electron, pages are loaded via the file:// protocol, where crossorigin
// requests are blocked by Chromium's CORS rules — this causes the built CSS
// (and sometimes JS) to silently fail to load, leaving the app unstyled.
import { readFileSync, writeFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const indexPath = join(__dirname, '../dist/index.html')

let html = readFileSync(indexPath, 'utf-8')
const before = html
html = html.replace(/\s+crossorigin(="[^"]*")?/g, '')

if (html !== before) {
  writeFileSync(indexPath, html)
  console.log('[fix-html] Removed crossorigin attributes from dist/index.html')
} else {
  console.log('[fix-html] No crossorigin attributes found, nothing to do')
}
