import { useState } from 'react'
import { AI_GATEWAY_BASE_URL } from '@/shared/api'
import { copyToClipboard } from '@/shared/lib/copyToClipboard'
import styles from './AiApiExamples.module.css'

type Tab = 'python' | 'js' | 'curl'

const TABS: { id: Tab; label: string }[] = [
  { id: 'python', label: 'Python (OpenAI SDK)' },
  { id: 'js', label: 'JavaScript (OpenAI SDK)' },
  { id: 'curl', label: 'curl' },
]

const MODEL = 'qwen2.5:3b'

function buildSnippet(tab: Tab, apiKey: string, baseUrl: string): string {
  const url = `${baseUrl}/v1`
  if (tab === 'python') {
    return [
      'from openai import OpenAI',
      '',
      `client = OpenAI(api_key="${apiKey}", base_url="${url}")`,
      '',
      'response = client.chat.completions.create(',
      `    model="${MODEL}",`,
      '    messages=[{"role": "user", "content": "Hola, ¿cómo estás?"}],',
      ')',
      'print(response.choices[0].message.content)',
    ].join('\n')
  }
  if (tab === 'js') {
    return [
      "import OpenAI from 'openai'",
      '',
      `const client = new OpenAI({ apiKey: '${apiKey}', baseURL: '${url}' })`,
      '',
      'const response = await client.chat.completions.create({',
      `  model: '${MODEL}',`,
      "  messages: [{ role: 'user', content: 'Hola, ¿cómo estás?' }],",
      '})',
      'console.log(response.choices[0].message.content)',
    ].join('\n')
  }
  return [
    `curl -X POST ${url}/chat/completions \\`,
    `  -H "Authorization: Bearer ${apiKey}" \\`,
    '  -H "Content-Type: application/json" \\',
    '  -d \'{',
    `    "model": "${MODEL}",`,
    '    "messages": [{"role": "user", "content": "Hola, ¿cómo estás?"}]',
    "  }'",
  ].join('\n')
}

export function AiApiExamples({ apiKey }: { apiKey?: string }) {
  const [tab, setTab] = useState<Tab>('python')
  const [copied, setCopied] = useState(false)

  const baseUrl = AI_GATEWAY_BASE_URL || '<TU_BASE_URL_DEL_GATEWAY>'
  const keyForSnippet = apiKey ?? 'TU_API_KEY'
  const snippet = buildSnippet(tab, keyForSnippet, baseUrl)

  async function handleCopy() {
    await copyToClipboard(snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Cómo usar tu API-Key</h3>
      <p className={styles.subtitle}>
        El gateway es compatible con el SDK oficial de OpenAI — solo cambia <code>base_url</code> y tu clave. Modelo
        disponible hoy: <code>{MODEL}</code>.
      </p>

      {!AI_GATEWAY_BASE_URL && (
        <p className={styles.pending}>
          La URL pública del gateway todavía no está confirmada por backend — el ejemplo de abajo usa un placeholder.
        </p>
      )}

      <div className={styles.tabs} role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`${styles.tab} ${tab === t.id ? styles.tabActive : ''}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={styles.codeBlock}>
        <pre className={styles.pre}>
          <code>{snippet}</code>
        </pre>
        <button type="button" className={styles.copyBtn} onClick={handleCopy}>
          {copied ? 'Copiado' : 'Copiar'}
        </button>
      </div>
    </div>
  )
}
