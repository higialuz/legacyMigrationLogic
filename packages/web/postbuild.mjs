import { cpSync, mkdirSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
import { createRequire } from 'module'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(pathToFileURL(__dirname).href)

const standaloneModules = join(__dirname, '.next', 'standalone', 'node_modules')
mkdirSync(standaloneModules, { recursive: true })

for (const pkg of ['react', 'react-dom', 'scheduler']) {
  const src = dirname(require.resolve(`${pkg}/package.json`))
  const dest = join(standaloneModules, pkg)
  if (!existsSync(dest)) {
    cpSync(src, dest, { recursive: true })
    console.log(`copied ${pkg}`)
  }
}
