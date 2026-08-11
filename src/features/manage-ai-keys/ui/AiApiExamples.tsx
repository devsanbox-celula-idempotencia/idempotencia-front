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

function buildSnippet(tab: Tab, apiKey: string, url: string, model: string): string {
  if (tab === 'python') {
    return [
      'from openai import OpenAI',
      '',
      `client = OpenAI(api_key="${apiKey}", base_url="${url}")`,
      '',
      'response = client.chat.completions.create(',
      `    model="${model}",`,
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
      `  model: '${model}',`,
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
    `    "model": "${model}",`,
    '    "messages": [{"role": "user", "content": "Hola, ¿cómo estás?"}]',
    "  }'",
  ].join('\n')
}

interface AiApiExamplesProps {
  apiKey?: string
  /** Ya viene con `/v1` incluido cuando sale de una creación real (`POST /me/api-keys`). */
  baseUrl?: string
  model?: string
}

export function AiApiExamples({ apiKey, baseUrl, model }: AiApiExamplesProps) {
  const [tab, setTab] = useState<Tab>('python')
  const [copied, setCopied] = useState(false)

  // Sin una key recién creada no hay `base_url`/`model` reales que mostrar — el env
  // configurado es la mejor aproximación (no está "quemado", es la config del despliegue),
  // pero el modelo no tiene de dónde salir hasta que exista una respuesta real del gateway.
  const effectiveBaseUrl = baseUrl ?? (AI_GATEWAY_BASE_URL ? `${AI_GATEWAY_BASE_URL}/v1` : '<TU_BASE_URL_DEL_GATEWAY>')
  const effectiveModel = model ?? '<TU_MODELO>'
  const keyForSnippet = apiKey ?? 'TU_API_KEY'
  const snippet = buildSnippet(tab, keyForSnippet, effectiveBaseUrl, effectiveModel)

  async function handleCopy() {
    await copyToClipboard(snippet)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Cómo usar tu API-Key</h3>
      <p className={styles.subtitle}>
        El gateway es compatible con el SDK oficial de OpenAI — solo cambia <code>base_url</code>, el modelo y tu clave.
      </p>

      {!baseUrl && !AI_GATEWAY_BASE_URL && (
        <p className={styles.pending}>
          La URL del gateway no está configurada — el ejemplo de abajo usa un placeholder.
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
