import { useCallback, useEffect, useState } from 'react';
import { ownerApi } from '../../api/ownerApi';
import Alert from '../ui/Alert';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Spinner from '../ui/Spinner';
import { getApiData, getApiError } from '../../utils/apiHelpers';

const DOC_LABELS = {
  NATIONAL_ID: 'CIN (Carte nationale)',
  BUSINESS_REGISTRATION: 'Registre de Commerce',
  BUSINESS_LICENSE: 'Licence commerciale (optionnel)',
  EXTERIOR_PHOTO: 'Photo extérieure du local',
};

const REQUIRED = ['NATIONAL_ID', 'BUSINESS_REGISTRATION', 'EXTERIOR_PHOTO'];

export default function OwnerVerificationPanel({ businessId }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    if (!businessId) return;
    setLoading(true);
    setError('');
    try {
      const response = await ownerApi.getVerificationStatus(businessId);
      setStatus(getApiData(response));
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpload = async (type, file) => {
    if (!file) return;
    setUploading(type);
    setError('');
    setSuccess('');
    try {
      await ownerApi.uploadVerificationDocument(businessId, type, file);
      setSuccess(`${DOC_LABELS[type]} téléchargé.`);
      await load();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setUploading(null);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');
    setSuccess('');
    try {
      const response = await ownerApi.submitVerification(businessId);
      setStatus(getApiData(response));
      setSuccess('Dossier soumis — un administrateur va examiner vos documents.');
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (!businessId) {
    return (
      <Card>
        <p className="text-ink-muted">Sélectionnez un établissement pour gérer la vérification.</p>
      </Card>
    );
  }

  if (loading) return <Spinner label="Chargement du dossier..." />;

  const statusBanner = {
    PENDING: { className: 'badge-gold', label: 'En attente de validation admin' },
    APPROVED: { className: 'badge-arena', label: 'Approuvé — visible sur FanConnect' },
    REJECTED: { className: 'bg-red-100 text-red-800 rounded-full px-3 py-1 text-xs font-bold', label: 'Rejeté' },
  }[status?.status] || { className: 'badge-arena', label: status?.status };

  return (
    <Card className="space-y-6">
      <div>
        <span className={statusBanner.className}>{statusBanner.label}</span>
        {status?.rejectionReason && (
          <Alert variant="error" className="mt-4">
            Motif du rejet : {status.rejectionReason}
          </Alert>
        )}
        {status?.verificationSubmittedAt && (
          <p className="mt-2 text-sm text-ink-faint">
            Soumis le {new Date(status.verificationSubmittedAt).toLocaleString('fr-FR')}
          </p>
        )}
      </div>

      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <div className="space-y-4">
        {Object.entries(DOC_LABELS).map(([type, label]) => {
          const present = status?.requiredDocumentsPresent?.[type];
          const isRequired = REQUIRED.includes(type);
          return (
            <div
              key={type}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-surface-border bg-surface-muted/50 p-4"
            >
              <div>
                <p className="font-semibold text-ink">
                  {label}
                  {isRequired && <span className="text-red-600"> *</span>}
                </p>
                <p className="text-xs text-ink-faint">
                  {present ? '✓ Document fourni' : 'Manquant'}
                </p>
              </div>
              {(status?.status === 'PENDING' || status?.status === 'REJECTED') && !status?.verificationComplete && (
                <label className="btn-arena-outline cursor-pointer px-4 py-2 text-xs">
                  {uploading === type ? 'Envoi...' : present ? 'Remplacer' : 'Téléverser'}
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="hidden"
                    disabled={!!uploading}
                    onChange={(e) => handleUpload(type, e.target.files?.[0])}
                  />
                </label>
              )}
            </div>
          );
        })}
      </div>

      {status?.readyToSubmit && (
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Soumission...' : 'Soumettre pour validation admin'}
        </Button>
      )}

      {status?.verificationComplete && status?.status === 'PENDING' && (
        <Alert variant="info">
          Votre dossier est en cours d&apos;examen. Vous serez notifié dès la décision.
        </Alert>
      )}
    </Card>
  );
}