import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import BusinessStatusBadge from '../business/BusinessStatusBadge';
import VenuesMap from '../business/VenuesMap';
import Alert from '../ui/Alert';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Spinner from '../ui/Spinner';
import { getApiData, getApiError } from '../../utils/apiHelpers';

const DOC_LABELS = {
  NATIONAL_ID: 'CIN',
  BUSINESS_REGISTRATION: 'Registre de Commerce',
  BUSINESS_LICENSE: 'Licence',
  EXTERIOR_PHOTO: 'Photo extérieure',
};

function isImageDocument(doc) {
  if (doc.mimeType?.startsWith('image/')) return true;
  const name = doc.originalName?.toLowerCase() || '';
  return /\.(jpe?g|png|webp)$/.test(name);
}

function resolveDocumentMimeType(doc, response) {
  const headerType = response.headers['content-type']?.split(';')[0]?.trim();
  if (headerType && headerType !== 'application/octet-stream') return headerType;
  if (doc.mimeType) return doc.mimeType;
  const name = doc.originalName?.toLowerCase() || '';
  if (name.endsWith('.png')) return 'image/png';
  if (name.endsWith('.webp')) return 'image/webp';
  if (name.endsWith('.jpg') || name.endsWith('.jpeg')) return 'image/jpeg';
  if (name.endsWith('.pdf')) return 'application/pdf';
  return 'application/octet-stream';
}

function VerificationDocumentItem({ businessId, doc, onError }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const isImage = isImageDocument(doc);

  const openDocument = async () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank', 'noopener');
      return;
    }

    try {
      const response = await adminApi.fetchVerificationDocument(businessId, doc.id);
      const mimeType = resolveDocumentMimeType(doc, response);
      const blob = new Blob([response.data], { type: mimeType });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      onError(getApiError(err));
    }
  };

  useEffect(() => {
    if (!isImage || !businessId) return undefined;

    let objectUrl;
    const loadPreview = async () => {
      setLoadingPreview(true);
      try {
        const response = await adminApi.fetchVerificationDocument(businessId, doc.id);
        const mimeType = resolveDocumentMimeType(doc, response);
        const blob = new Blob([response.data], { type: mimeType });
        objectUrl = URL.createObjectURL(blob);
        setPreviewUrl(objectUrl);
      } catch (err) {
        onError(getApiError(err));
      } finally {
        setLoadingPreview(false);
      }
    };

    loadPreview();
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [businessId, doc.id, doc.mimeType, doc.originalName, isImage, onError]);

  return (
    <div className="rounded-xl border border-surface-border px-3 py-2 text-sm">
      <div className="flex items-center justify-between gap-3">
        <span>
          {DOC_LABELS[doc.documentType] || doc.documentType}
          <span className="ml-2 text-ink-faint">{doc.originalName}</span>
        </span>
        <button
          type="button"
          className="shrink-0 text-primary-700 font-semibold hover:underline"
          onClick={openDocument}
        >
          Voir
        </button>
      </div>
      {isImage && (
        <div className="mt-3">
          {loadingPreview && (
            <p className="text-xs text-ink-faint">Chargement de l&apos;aperçu...</p>
          )}
          {previewUrl && (
            <button type="button" onClick={openDocument} className="block w-full text-left">
              <img
                src={previewUrl}
                alt={DOC_LABELS[doc.documentType] || doc.documentType}
                className="max-h-72 w-full rounded-lg bg-surface-muted object-contain"
              />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdminVerificationPanel({
  initialBusinessId = null,
  onPendingCountChange,
}) {
  const [pending, setPending] = useState([]);
  const [selectedId, setSelectedId] = useState(initialBusinessId);
  const [detail, setDetail] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');

  const loadPending = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminApi.getPendingVerifications();
      const list = getApiData(response) || [];
      setPending(list);
      onPendingCountChange?.(list.length);
      setSelectedId((current) => {
        if (initialBusinessId && list.some((b) => b.id === initialBusinessId)) {
          return initialBusinessId;
        }
        if (current && list.some((b) => b.id === current)) {
          return current;
        }
        return list[0]?.id ?? null;
      });
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [initialBusinessId]);

  const loadDetail = useCallback(async (businessId) => {
    if (!businessId) return;
    setDetailLoading(true);
    try {
      const response = await adminApi.getVerificationDetail(businessId);
      setDetail(getApiData(response));
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setDetailLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  useEffect(() => {
    if (initialBusinessId) {
      setSelectedId(initialBusinessId);
    }
  }, [initialBusinessId]);

  useEffect(() => {
    if (selectedId) loadDetail(selectedId);
  }, [selectedId, loadDetail]);

  const handleApprove = async () => {
    setActionLoading(true);
    setError('');
    try {
      await adminApi.approveVerification(selectedId);
      setDetail(null);
      setSelectedId(null);
      await loadPending();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setError('Motif de rejet requis');
      return;
    }
    setActionLoading(true);
    setError('');
    try {
      await adminApi.rejectVerification(selectedId, rejectReason.trim());
      setRejectReason('');
      setDetail(null);
      await loadPending();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Spinner label="Chargement du centre de vérification..." />;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-xl font-bold text-ink">Centre de vérification</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Examinez les documents avant d&apos;approuver un établissement.
        </p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {pending.length === 0 ? (
        <Card>
          <p className="text-ink-muted">Aucun dossier en attente avec documents complets.</p>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <Card className="space-y-2 p-3">
            {pending.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setSelectedId(b.id)}
                className={`w-full rounded-xl p-3 text-left transition ${
                  selectedId === b.id
                    ? 'bg-primary-50 ring-2 ring-primary-200'
                    : 'hover:bg-surface-muted'
                }`}
              >
                <p className="font-semibold text-ink">{b.name}</p>
                <p className="text-xs text-ink-faint">{b.city}</p>
              </button>
            ))}
          </Card>

          <div className="space-y-4">
            {detailLoading && <Spinner label="Chargement du dossier..." />}
            {detail && !detailLoading && (
              <>
                <Card>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="font-display text-lg font-bold text-ink">
                        {detail.business?.name}
                      </h3>
                      <p className="text-sm text-ink-muted">
                        {detail.business?.ownerName} · {detail.business?.city}
                      </p>
                      <BusinessStatusBadge status={detail.business?.status} />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleApprove} disabled={actionLoading}>
                        Approuver
                      </Button>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-ink-muted">{detail.business?.description}</p>
                  <p className="mt-2 text-sm text-ink">
                    {detail.business?.address} — {detail.business?.totalCapacity} places
                  </p>
                </Card>

                <Card>
                  <h4 className="font-semibold text-ink">Documents</h4>
                  <div className="mt-3 space-y-2">
                    {detail.verification?.documents?.map((doc) => (
                      <VerificationDocumentItem
                        key={doc.id}
                        businessId={selectedId}
                        doc={doc}
                        onError={setError}
                      />
                    ))}
                  </div>
                </Card>

                {detail.business?.latitude && (
                  <Card>
                    <h4 className="mb-3 font-semibold text-ink">Localisation GPS</h4>
                    <VenuesMap
                      businesses={[{
                        id: detail.business.id,
                        name: detail.business.name,
                        latitude: detail.business.latitude,
                        longitude: detail.business.longitude,
                        city: detail.business.city,
                      }]}
                      singleBusiness
                      highlightedBusinessId={detail.business.id}
                    />
                  </Card>
                )}

                <Card>
                  <h4 className="font-semibold text-ink">Rejeter le dossier</h4>
                  <textarea
                    className="input-arena mt-3"
                    rows={3}
                    placeholder="Motif du rejet (obligatoire)"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                  <Button
                    variant="danger"
                    className="mt-3"
                    onClick={handleReject}
                    disabled={actionLoading}
                  >
                    Rejeter
                  </Button>
                </Card>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}