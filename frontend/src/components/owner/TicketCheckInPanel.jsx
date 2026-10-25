import { useCallback, useEffect, useRef, useState } from 'react';
import { ownerApi } from '../../api/ownerApi';
import Alert from '../ui/Alert';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Spinner from '../ui/Spinner';
import { getApiData, getApiError } from '../../utils/apiHelpers';
import { formatDateTime } from '../../utils/formatDate';

function normalizeTicketInput(raw) {
  const trimmed = raw.trim();
  if (trimmed.toUpperCase().startsWith('FANCONNECT|TICKET|')) {
    return trimmed.substring('FANCONNECT|TICKET|'.length).trim();
  }
  if (trimmed.includes('|')) {
    return trimmed.split('|').pop().trim();
  }
  return trimmed;
}

export default function TicketCheckInPanel({ onCheckedIn, initialTicket = '' }) {
  const [ticketInput, setTicketInput] = useState(initialTicket || '');
  const [mode, setMode] = useState('manual');
  const [loading, setLoading] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [scanSupported, setScanSupported] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanLoopRef = useRef(null);

  useEffect(() => {
    setScanSupported(typeof window !== 'undefined' && 'BarcodeDetector' in window);
  }, []);

  const stopCamera = useCallback(() => {
    if (scanLoopRef.current) {
      cancelAnimationFrame(scanLoopRef.current);
      scanLoopRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const handleVerify = useCallback(async (codeOverride) => {
    const code = normalizeTicketInput(codeOverride ?? ticketInput);
    if (!code) {
      setError('Saisissez ou scannez un code ticket');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await ownerApi.verifyTicket(code);
      setResult(getApiData(response));
      setTicketInput(code);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, [ticketInput]);

  useEffect(() => {
    if (!initialTicket) return undefined;
    const code = normalizeTicketInput(initialTicket);
    setTicketInput(code);
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError('');
      setResult(null);
      try {
        const response = await ownerApi.verifyTicket(code);
        if (!cancelled) setResult(getApiData(response));
      } catch (err) {
        if (!cancelled) setError(getApiError(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialTicket]);

  const handleCheckIn = async () => {
    const code = result?.ticketCode || normalizeTicketInput(ticketInput);
    if (!code) return;
    setCheckingIn(true);
    setError('');
    try {
      const response = await ownerApi.checkInTicket(code);
      setResult(getApiData(response));
      onCheckedIn?.();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setCheckingIn(false);
    }
  };

  const startCameraScan = async () => {
    if (!scanSupported) {
      setError('Scanner caméra non supporté sur ce navigateur — saisissez le code manuellement.');
      return;
    }
    setError('');
    setMode('camera');
    setScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // BarcodeDetector — Chrome/Edge; optional browser API
      const detector = new window.BarcodeDetector({ formats: ['qr_code'] }); // eslint-disable-line no-undef
      const scanFrame = async () => {
        if (!videoRef.current || !streamRef.current) return;
        try {
          const barcodes = await detector.detect(videoRef.current);
          if (barcodes.length > 0) {
            const raw = barcodes[0].rawValue;
            stopCamera();
            setTicketInput(raw);
            await handleVerify(raw);
            return;
          }
        } catch {
          // continue scanning
        }
        scanLoopRef.current = requestAnimationFrame(scanFrame);
      };
      scanLoopRef.current = requestAnimationFrame(scanFrame);
    } catch (err) {
      stopCamera();
      setError('Impossible d\'accéder à la caméra. Autorisez l\'accès ou saisissez le code.');
      setMode('manual');
    }
  };

  const switchToManual = () => {
    stopCamera();
    setMode('manual');
  };

  return (
    <div className="space-y-6">
      <Card>
        <h2 className="font-display text-lg font-bold text-ink">Valider un ticket à l&apos;entrée</h2>
        <p className="mt-1 text-sm text-ink-muted">
          1. Scannez le QR du PDF fan ou saisissez le code (ex. FC-XXXXXXXX).
          {' '}2. Vérifiez l&apos;identité. 3. Confirmez le check-in.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={switchToManual}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              mode === 'manual'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Saisir le code
          </button>
          <button
            type="button"
            onClick={startCameraScan}
            disabled={scanning}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              mode === 'camera'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {scanning ? 'Scan en cours...' : 'Scanner QR (caméra)'}
          </button>
        </div>

        {mode === 'camera' && (
          <div className="mt-4">
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-black">
              <video
                ref={videoRef}
                className="mx-auto max-h-64 w-full object-cover"
                playsInline
                muted
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Pointez la caméra vers le QR code du ticket PDF.
            </p>
            <Button variant="secondary" className="mt-2" onClick={switchToManual}>
              Arrêter le scan
            </Button>
          </div>
        )}

        {mode === 'manual' && (
          <div className="mt-4 flex flex-wrap gap-3">
            <Input
              className="min-w-[240px] flex-1"
              placeholder="FC-XXXXXXXX ou FANCONNECT|TICKET|..."
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            />
            <Button onClick={() => handleVerify()} disabled={loading}>
              {loading ? 'Vérification...' : 'Vérifier'}
            </Button>
          </div>
        )}

        {error && (
          <div className="mt-4">
            <Alert variant="error">{error}</Alert>
          </div>
        )}
      </Card>

      {loading && <Spinner label="Vérification du ticket..." />}

      {result && !loading && (
        <Card
          className={
            result.valid && result.canCheckIn
              ? 'border-green-200 bg-green-50'
              : result.alreadyCheckedIn
                ? 'border-amber-200 bg-amber-50'
                : result.valid
                  ? 'border-blue-200 bg-blue-50'
                  : 'border-red-200 bg-red-50'
          }
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                {result.valid ? 'Ticket reconnu' : 'Ticket invalide'}
              </p>
              <p className="mt-1 text-lg font-bold text-gray-900">{result.message}</p>
              {result.ticketCode && (
                <p className="mt-1 font-mono text-sm text-primary-700">{result.ticketCode}</p>
              )}
            </div>
            {result.valid && result.canCheckIn && (
              <Button onClick={handleCheckIn} disabled={checkingIn}>
                {checkingIn ? 'Check-in...' : 'Confirmer check-in'}
              </Button>
            )}
          </div>

          {result.valid && result.fanName && (
            <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-medium text-gray-500">Fan</dt>
                <dd className="text-gray-900">{result.fanName}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Email</dt>
                <dd className="text-gray-900">{result.fanEmail}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Téléphone</dt>
                <dd className="text-gray-900">{result.fanPhone || '—'}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Ville</dt>
                <dd className="text-gray-900">{result.fanCity || '—'}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Match</dt>
                <dd className="text-gray-900">{result.matchLabel || '—'}</dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Table</dt>
                <dd className="text-gray-900">
                  {result.businessName}
                  {result.tableNumber && ` · Table ${result.tableNumber}`}
                  {result.spaceName && ` · ${result.spaceName}`}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Date</dt>
                <dd className="text-gray-900">
                  {result.reservationDateTime
                    ? formatDateTime(result.reservationDateTime)
                    : '—'}
                </dd>
              </div>
              <div>
                <dt className="font-medium text-gray-500">Personnes</dt>
                <dd className="text-gray-900">{result.partySize}</dd>
              </div>
            </dl>
          )}

          {result.alreadyCheckedIn && result.checkedInAt && (
            <p className="mt-4 text-sm text-amber-800">
              Check-in effectué le {formatDateTime(result.checkedInAt)}
            </p>
          )}
        </Card>
      )}
    </div>
  );
}