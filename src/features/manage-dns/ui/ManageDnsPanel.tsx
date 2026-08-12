import { Button } from '@/shared/ui'
import { useManageDnsRecords } from '../model/useManageDnsRecords'
import { CreateDnsRecordForm } from './CreateDnsRecordForm'
import { DnsRecordsList } from './DnsRecordsList'
import { DnsRecordCreatedPanel } from './DnsRecordCreatedPanel'
import styles from './ManageDnsPanel.module.css'

export function ManageDnsPanel() {
  const {
    records,
    listError,
    reloadRecords,
    quotaReached,
    justCreated,
    dismissJustCreated,
    labelInput,
    setLabelInput,
    ipInput,
    setIpInput,
    createError,
    isCreating,
    handleCreate,
    nameSuggestion,
    cooldownSeconds,
    pendingReassignId,
    reassignIpInput,
    setReassignIpInput,
    reassignError,
    isReassigning,
    requestReassign,
    cancelReassign,
    confirmReassign,
    pendingDeleteId,
    deleteError,
    isDeleting,
    requestDelete,
    cancelDelete,
    confirmDelete,
  } = useManageDnsRecords()

  if (justCreated) {
    return (
      <div className={styles.panel}>
        <DnsRecordCreatedPanel record={justCreated} onDismiss={dismissJustCreated} />
      </div>
    )
  }

  return (
    <div className={styles.panel}>
      <CreateDnsRecordForm
        labelInput={labelInput}
        setLabelInput={setLabelInput}
        ipInput={ipInput}
        setIpInput={setIpInput}
        createError={createError}
        isCreating={isCreating}
        onSubmit={handleCreate}
        nameSuggestion={nameSuggestion}
        cooldownSeconds={cooldownSeconds}
        quotaReached={quotaReached}
        recordCount={records?.length ?? 0}
      />

      {records === null ? (
        <p className={styles.loading}>Cargando tus subdominios…</p>
      ) : listError && records.length === 0 ? (
        <div className={styles.empty}>
          <p>No pudimos cargar tus subdominios: {listError}</p>
          <Button variant="primary" onClick={reloadRecords}>
            Reintentar
          </Button>
        </div>
      ) : (
        <DnsRecordsList
          records={records}
          pendingReassignId={pendingReassignId}
          reassignIpInput={reassignIpInput}
          setReassignIpInput={setReassignIpInput}
          reassignError={reassignError}
          isReassigning={isReassigning}
          onRequestReassign={requestReassign}
          onCancelReassign={cancelReassign}
          onConfirmReassign={confirmReassign}
          pendingDeleteId={pendingDeleteId}
          deleteError={deleteError}
          isDeleting={isDeleting}
          onRequestDelete={requestDelete}
          onCancelDelete={cancelDelete}
          onConfirmDelete={confirmDelete}
        />
      )}
    </div>
  )
}
