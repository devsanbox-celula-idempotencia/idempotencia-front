import styles from './ComingSoonPanel.module.css'

interface ComingSoonPanelProps {
  title: string
  description: string
  bullets: string[]
}

export function ComingSoonPanel({ title, description, bullets }: ComingSoonPanelProps) {
  return (
    <div className={styles.panel}>
      <span className={styles.badge}>Próximamente</span>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
      <ul className={styles.bullets}>
        {bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
    </div>
  )
}
