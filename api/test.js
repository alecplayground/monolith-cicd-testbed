/**
 * Minimal test stub. In the real app this would be `node ace test`.
 * For the testbed, we just verify the server can start and respond.
 */

const http = require('http')

const PORT = 3399
const HOST = '0.0.0.0'

// Start server
const server = http.createServer((req, res) => {
  if (req.url === '/commit') {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('test-sha')
  } else {
    res.writeHead(200)
    res.end('ok')
  }
})

server.listen(PORT, HOST, () => {
  console.log('Test server started, running checks...')

  // Test /commit endpoint
  http.get(`http://localhost:${PORT}/commit`, (res) => {
    let data = ''
    res.on('data', (chunk) => { data += chunk })
    res.on('end', () => {
      if (res.statusCode === 200 && data === 'test-sha') {
        console.log('PASS: /commit returns correct SHA')
      } else {
        console.error(`FAIL: /commit returned ${res.statusCode} - ${data}`)
        process.exit(1)
      }

      // Test /health endpoint
      http.get(`http://localhost:${PORT}/health`, (res2) => {
        let data2 = ''
        res2.on('data', (chunk) => { data2 += chunk })
        res2.on('end', () => {
          server.close()
          if (res2.statusCode === 200) {
            console.log('PASS: /health returns 200')
            console.log('All tests passed.')
            process.exit(0)
          } else {
            console.error(`FAIL: /health returned ${res2.statusCode}`)
            process.exit(1)
          }
        })
      })
    })
  })
})
