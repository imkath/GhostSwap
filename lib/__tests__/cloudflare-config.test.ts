import { readFileSync } from 'node:fs'
import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

describe('Cloudflare asset routing', () => {
  it('serves verification HTML at its exact file path', () => {
    const source = readFileSync(join(process.cwd(), 'wrangler.jsonc'), 'utf8')
    const config = JSON.parse(source.replace(/,\s*([}\]])/g, '$1')) as {
      assets?: { html_handling?: string }
    }

    expect(config.assets?.html_handling).toBe('none')
  })
})
