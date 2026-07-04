import { defineConfig } from 'vite'
import { resolve } from 'node:path'

// Extra top-level pages that should resolve at a clean, extensionless URL
// (e.g. /gear -> gear.html) both in dev and in the production build.
const PAGES = [
  'gear',
  'shop',
  'blog',
  'resources',
  'collabs',
  'consulting',
  'projects',
  'experience',
  'stack',
  'certifications',
  'recommendations',
  'affiliations',
]

// Dev middleware: rewrite "/gear" (and "/gear/") to "/gear.html" so the
// browser can use clean URLs while Vite still serves the real HTML entry.
function cleanUrls() {
  return {
    name: 'clean-urls',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url) {
          const [path, query] = req.url.split('?')
          const clean = path.replace(/\/+$/, '') || '/'
          if (PAGES.includes(clean.slice(1))) {
            req.url = `${clean}.html${query ? `?${query}` : ''}`
          }
        }
        next()
      })
    },
  }
}

export default defineConfig({
  appType: 'mpa',
  plugins: [cleanUrls()],
  server: {
    // Bind on every interface (0.0.0.0 + ::) so the preview reaches it over
    // both IPv4 (127.0.0.1) and IPv6 (::1). Vite's default binds IPv6-only,
    // which the IPv4 preview proxy can't connect to.
    host: true,
    // Vite 5.4+ rejects requests whose Host header isn't an IP/localhost with
    // a 403. The Inspector preview proxy forwards a hostname that trips this,
    // so allow any host in dev (and HMR over the proxy).
    allowedHosts: true,
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        ...Object.fromEntries(
          PAGES.map((p) => [p, resolve(__dirname, `${p}.html`)]),
        ),
      },
    },
  },
})
