export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" aria-hidden="true">
      <defs>
        <linearGradient id="idm-logo-bar-a" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff9d8c" />
          <stop offset="1" stopColor="#ff6b52" />
        </linearGradient>
        <linearGradient id="idm-logo-bar-b" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a89bff" />
          <stop offset="1" stopColor="#7a68f2" />
        </linearGradient>
      </defs>
      <rect x="6" y="12" width="60" height="13" rx="6.5" fill="url(#idm-logo-bar-a)" />
      <rect x="6" y="29.5" width="60" height="13" rx="6.5" fill="url(#idm-logo-bar-b)" />
      <rect x="6" y="47" width="60" height="13" rx="6.5" fill="url(#idm-logo-bar-a)" />
    </svg>
  )
}
