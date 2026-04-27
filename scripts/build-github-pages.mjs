import { spawnSync } from 'node:child_process'

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const result = spawnSync(npmCommand, ['run', 'build'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: {
    ...process.env,
    GITHUB_PAGES: 'true',
  },
})

process.exit(result.status ?? 1)
