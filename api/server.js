/**
 * Minimal Express stub that mimics the AdonisJS app's health check behavior.
 * This is ONLY for testing the CI/CD pipeline — not the real app.
 *
 * Endpoints:
 *   GET /commit  — returns the COMMIT_SHA env var (used by Traefik health checks)
 *   GET /health  — basic health check
 */

const http = require('http')

const PORT = process.env.PORT || 3333
const HOST = process.env.HOST || '0.0.0.0'
const COMMIT_SHA = process.env.COMMIT_SHA || 'unknown'

const server = http.createServer((req, res) => {
  if (req.url === '/commit') {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end(COMMIT_SHA)
  } else if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ status: 'ok', commit: COMMIT_SHA }))
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('monolith-cicd-testbed')
  }
})

server.listen(PORT, HOST, () => {
  console.log(`Server running on ${HOST}:${PORT}`)
  console.log(`Commit: ${COMMIT_SHA}`)
})
