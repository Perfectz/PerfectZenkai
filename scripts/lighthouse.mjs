#!/usr/bin/env node

import { spawn } from 'child_process'

async function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
    })

    child.on('close', (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`Command failed with code ${code}`))
      }
    })
  })
}

async function runLighthouse() {
  let previewProcess

  try {
    console.log('Building production bundle...')
    await runCommand('npm', ['run', 'build'])

    console.log('Starting preview server...')
    previewProcess = spawn('npm', ['run', 'preview'], {
      stdio: 'pipe',
      shell: true,
    })

    await new Promise((resolve) => setTimeout(resolve, 3000))

    console.log('Running Lighthouse PWA audit...')
    await runCommand('npx', [
      '--yes',
      '@lhci/cli',
      'autorun',
      '--collect.url=http://localhost:4173',
      '--collect.numberOfRuns=1',
      '--assert.preset=lighthouse:recommended',
      '--assert.assertions.pwa=0.9',
      '--assert.assertions.performance=0.8',
      '--assert.assertions.accessibility=0.9',
      '--assert.assertions.best-practices=0.9',
      '--assert.assertions.seo=0.8',
      '--upload.target=temporary-public-storage',
    ])

    console.log('Lighthouse audit completed successfully.')
  } catch (error) {
    console.error('Lighthouse audit failed:', error.message)
    process.exitCode = 1
  } finally {
    previewProcess?.kill()
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runLighthouse()
}
