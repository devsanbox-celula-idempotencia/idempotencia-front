import { Button, CredentialRevealCard } from '@/shared/ui'
import { useManageAiKeys } from '../model/useManageAiKeys'
import { CreateAiKeyForm } from './CreateAiKeyForm'
import { AiKeysList } from './AiKeysList'
import { AiApiExamples } from './AiApiExamples'
import styles from './ManageAiKeysPanel.module.css'

export function ManageAiKeysPanel() {
  const {
    keys,
    listError,
    reloadKeys,
    justCreated,
    dismissJustCreated,
    nameInput,
    setNameInput,
    createError,
    isCreating,
    handleCreate,
    pendingRevokeId,
    revokeError,
    isRevoking,
    requestRevoke,
    cancelRevoke,
    confirmRevoke,
  } = useManageAiKeys()

  if (justCreated) {
    return (
      <div className={styles.panel}>
        <CredentialRevealCard
          title="Tu API-Key está lista"
          warningMessage="Guarda esta clave ahora — no vas a poder volver a verla completa."
          fields={[
            { label: 'Nombre', value: justCreated.name },
            { label: 'API Key', value: justCreated.apiKey, wide: true },
          ]}
          downloadFileName={`${justCreated.name}-api-key.txt`}
          downloadHeading="idempotencia — API-Key de IA"
          downloadNote="Guarda este archivo en un lugar seguro — la clave no volverá a mostrarse completa."
        />
        <Button variant="primary" onClick={dismissJustCreated}>
          Entendido, ver mis API-Keys
        </Button>
        <AiApiExamples apiKey={justCreated.apiKey} baseUrl={justCreated.baseUrl} model={justCreated.model} />
      </div>
    )
  }

  return (
    <div className={styles.panel}>
      <CreateAiKeyForm
        nameInput={nameInput}
        setNameInput={setNameInput}
        createError={createError}
        isCreating={isCreating}
        onSubmit={handleCreate}
      />

      {keys === null ? (
        <p className={styles.loading}>Cargando tus API-Keys…</p>
      ) : listError && keys.length === 0 ? (
        <div className={styles.empty}>
          <p>No pudimos cargar tus API-Keys: {listError}</p>
          <Button variant="primary" onClick={reloadKeys}>
            Reintentar
          </Button>
        </div>
      ) : (
        <AiKeysList
          keys={keys}
          pendingRevokeId={pendingRevokeId}
          revokeError={revokeError}
          isRevoking={isRevoking}
          onRequestRevoke={requestRevoke}
          onCancelRevoke={cancelRevoke}
          onConfirmRevoke={confirmRevoke}
        />
      )}

      <AiApiExamples />
    </div>
  )
}
