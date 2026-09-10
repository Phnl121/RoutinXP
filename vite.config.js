import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

// Arquivos de public/ que a casca do app usa e que o service worker guarda na instalação.
const PUBLICOS = [
  '/manifest.webmanifest',
  '/marca/routinxp-icone.svg',
  '/marca/routinxp-logo-horizontal.svg',
  '/marca/routinxp-icone-192.png',
  '/marca/routinxp-icone-512.png',
  '/marca/routinxp-icone-maskable-512.png',
  '/marca/routinxp-apple-touch-180.png',
]

// Gera dist/sw.js a partir de pwa/sw.js, com a lista de arquivos do build e uma versão
// calculada do conteúdo: qualquer mudança no app vira uma versão nova do service worker.
function serviceWorker() {
  let saida = 'dist'
  return {
    name: 'routinxp-service-worker',
    apply: 'build',
    configResolved(config) {
      saida = config.build.outDir
    },
    writeBundle(_, bundle) {
      const hash = createHash('sha256')
      const gerados = []
      for (const [nome, item] of Object.entries(bundle)) {
        if (nome.endsWith('.map')) continue
        gerados.push(`/${nome}`)
        hash.update(nome).update(item.type === 'chunk' ? item.code : item.source)
      }
      const arquivos = [...new Set([...gerados, ...PUBLICOS])].sort()
      const modelo = readFileSync(new URL('./pwa/sw.js', import.meta.url), 'utf8')
      const sw = modelo
        .replace('__VERSAO__', hash.digest('hex').slice(0, 12))
        .replace('/* ARQUIVOS */ []', JSON.stringify(arquivos))
      writeFileSync(join(saida, 'sw.js'), sw)
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), serviceWorker()],
})
