import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ownerApi } from '../../api/ownerApi';
import Alert from '../../components/ui/Alert';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import { getApiData, getApiError } from '../../utils/apiHelpers';
import { ROUTES } from '../../utils/constants';
import { parseGoogleMapsCoordinates } from '../../utils/parseMapsUrl';

const BUSINESS_TYPES = [
  { value: 'CAFE', label: 'Café' },
  { value: 'RESTAURANT', label: 'Restaurant' },
];

const SPACE_TYPES = [
  { value: 'TERRACE', label: 'Terrace' },
  { value: 'INDOOR_HALL', label: 'Indoor hall' },
  { value: 'VIP_ROOM', label: 'VIP room' },
  { value: 'FAMILY_AREA', label: 'Family area' },
  { value: 'WOMEN_AREA', label: 'Women area' },
  { value: 'OTHER', label: 'Other' },
];

function createDefaultSpace() {
  return {
    name: 'Main hall',
    spaceType: 'INDOOR_HALL',
    description: '',
    capacity: 20,
    numberOfTables: 5,
    matchDayPrice: 50,
  };
}

function createEmptyForm() {
  return {
    name: '',
    businessType: 'CAFE',
    description: '',
    country: 'Morocco',
    city: '',
    address: '',
    latitude: '',
    longitude: '',
    googleMapsUrl: '',
    contactPhone: '',
    contactEmail: '',
    coverImageUrl: '',
    galleryImageUrls: '',
    menuImageUrls: '',
    spaces: [createDefaultSpace()],
  };
}

function parseUrlList(value) {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function isGoogleMapsUrl(url) {
  return /google\.(com|[a-z]{2,3})\/maps|maps\.google\./i.test(url);
}

function normalizeLocationUrls(coverImageUrl, googleMapsUrl) {
  let cover = coverImageUrl.trim();
  let maps = googleMapsUrl.trim();

  if (cover && isGoogleMapsUrl(cover)) {
    if (!maps) {
      maps = cover;
    }
    cover = '';
  }

  return { coverImageUrl: cover, googleMapsUrl: maps };
}

function businessToForm(business) {
  return {
    name: business.name || '',
    businessType: business.businessType || 'CAFE',
    description: business.description || '',
    country: business.country || 'Morocco',
    city: business.city || '',
    address: business.address || '',
    latitude: business.latitude ?? '',
    longitude: business.longitude ?? '',
    googleMapsUrl: business.googleMapsUrl || '',
    contactPhone: business.contactPhone || '',
    contactEmail: business.contactEmail || '',
    coverImageUrl: business.coverImageUrl || '',
    galleryImageUrls: (business.galleryImageUrls || []).join('\n'),
    menuImageUrls: (business.menuImageUrls || []).join('\n'),
    spaces: (business.spaces || []).map((space) => ({
      name: space.name,
      spaceType: space.spaceType,
      description: space.description || '',
      capacity: space.capacity,
      numberOfTables: space.numberOfTables,
      matchDayPrice: Number(space.matchDayPrice),
    })),
  };
}

function buildPayload(form) {
  const spaces = form.spaces.map((space) => ({
    name: space.name,
    spaceType: space.spaceType,
    description: space.description || undefined,
    capacity: Number(space.capacity),
    numberOfTables: Number(space.numberOfTables),
    matchDayPrice: Number(space.matchDayPrice),
  }));

  const totalCapacity = spaces.reduce((sum, s) => sum + s.capacity, 0);
  const totalTables = spaces.reduce((sum, s) => sum + s.numberOfTables, 0);

  const payload = {
    name: form.name.trim(),
    businessType: form.businessType,
    description: form.description.trim(),
    country: form.country.trim(),
    city: form.city.trim(),
    address: form.address.trim(),
    totalCapacity,
    totalTables,
    spaces,
    galleryImageUrls: parseUrlList(form.galleryImageUrls),
    menuImageUrls: parseUrlList(form.menuImageUrls),
  };

  const { coverImageUrl, googleMapsUrl } = normalizeLocationUrls(
    form.coverImageUrl,
    form.googleMapsUrl
  );
  if (coverImageUrl) payload.coverImageUrl = coverImageUrl;
  if (googleMapsUrl) payload.googleMapsUrl = googleMapsUrl;
  if (form.contactPhone.trim()) payload.contactPhone = form.contactPhone.trim();
  if (form.contactEmail.trim()) payload.contactEmail = form.contactEmail.trim();
  if (form.latitude !== '') payload.latitude = Number(form.latitude);
  if (form.longitude !== '') payload.longitude = Number(form.longitude);

  return payload;
}

export default function BusinessFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(createEmptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const totals = useMemo(() => {
    const totalCapacity = form.spaces.reduce((sum, s) => sum + Number(s.capacity || 0), 0);
    const totalTables = form.spaces.reduce((sum, s) => sum + Number(s.numberOfTables || 0), 0);
    return { totalCapacity, totalTables };
  }, [form.spaces]);

  const resolvedLocation = useMemo(() => {
    if (form.latitude !== '' && form.longitude !== '') {
      return {
        lat: Number(form.latitude),
        lng: Number(form.longitude),
        source: 'manual',
      };
    }
    const fromMaps = parseGoogleMapsCoordinates(form.googleMapsUrl);
    if (fromMaps) {
      return { ...fromMaps, source: 'maps' };
    }
    if (form.address.trim() && form.city.trim()) {
      return {
        label: `${form.address.trim()}, ${form.city.trim()}, ${form.country.trim()}`,
        source: 'address',
      };
    }
    return null;
  }, [form.latitude, form.longitude, form.googleMapsUrl, form.address, form.city, form.country]);

  useEffect(() => {
    if (!isEdit) return;

    const loadBusiness = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await ownerApi.getBusiness(id);
        const business = getApiData(response);
        setForm(businessToForm(business));
      } catch (err) {
        setError(getApiError(err));
      } finally {
        setLoading(false);
      }
    };

    loadBusiness();
  }, [id, isEdit]);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const updateSpace = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      spaces: prev.spaces.map((space, i) =>
        i === index ? { ...space, [field]: value } : space
      ),
    }));
  };

  const addSpace = () => {
    setForm((prev) => ({
      ...prev,
      spaces: [...prev.spaces, createDefaultSpace()],
    }));
  };

  const removeSpace = (index) => {
    setForm((prev) => ({
      ...prev,
      spaces: prev.spaces.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload = buildPayload(form);
      const response = isEdit
        ? await ownerApi.updateBusiness(id, payload)
        : await ownerApi.submitBusiness(payload);

      setSuccess(
        isEdit
          ? 'Établissement mis à jour. Téléversez vos documents dans l\'onglet Vérification.'
          : 'Établissement créé. Complétez la vérification (CIN, RC, photo) dans le tableau de bord.'
      );

      const saved = getApiData(response);
      if (saved?.id) {
        setTimeout(() => navigate(ROUTES.OWNER_DASHBOARD), 1500);
      }
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner label="Loading business..." />;

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Link to={ROUTES.OWNER_DASHBOARD} className="text-sm text-primary-600 hover:text-primary-700">
          ← Back to dashboard
        </Link>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">
          {isEdit ? 'Modifier mon établissement' : 'Inscrire mon café / restaurant'}
        </h1>
        <p className="mt-2 text-gray-600">
          Renseignez l&apos;adresse et le lien Google Maps — la position GPS sera calculée automatiquement
          pour que les fans vous trouvent sur la carte et voient la distance en km.
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <Alert variant="error">{error}</Alert>
        </div>
      )}
      {success && (
        <div className="mb-6">
          <Alert variant="success">{success}</Alert>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h2 className="text-lg font-semibold text-gray-900">General information</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Input
              placeholder="Business name"
              value={form.name}
              onChange={(e) => updateField('name', e.target.value)}
              required
            />
            <select
              className="rounded-lg border border-gray-300 px-4 py-2"
              value={form.businessType}
              onChange={(e) => updateField('businessType', e.target.value)}
            >
              {BUSINESS_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <Input
              placeholder="Country"
              value={form.country}
              onChange={(e) => updateField('country', e.target.value)}
              required
            />
            <Input
              placeholder="City"
              value={form.city}
              onChange={(e) => updateField('city', e.target.value)}
              required
            />
            <Input
              className="md:col-span-2"
              placeholder="Address"
              value={form.address}
              onChange={(e) => updateField('address', e.target.value)}
              required
            />
            <textarea
              className="md:col-span-2 w-full rounded-lg border border-gray-300 px-4 py-2"
              rows={4}
              placeholder="Description"
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              required
            />
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900">Contact & localisation</h2>
          <p className="mt-1 text-sm text-gray-500">
            Collez le lien Google Maps de votre établissement (recommandé). Sinon, l&apos;adresse sera
            géolocalisée automatiquement à l&apos;envoi.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Input
              placeholder="Téléphone"
              value={form.contactPhone}
              onChange={(e) => updateField('contactPhone', e.target.value)}
            />
            <Input
              type="email"
              placeholder="Email de contact"
              value={form.contactEmail}
              onChange={(e) => updateField('contactEmail', e.target.value)}
            />
            <Input
              className="md:col-span-2"
              placeholder="Lien Google Maps (collez l'URL complète depuis Google Maps)"
              value={form.googleMapsUrl}
              onChange={(e) => updateField('googleMapsUrl', e.target.value)}
            />
            <Input
              className="md:col-span-2"
              placeholder="Photo de couverture (URL directe d'image, pas Google Maps)"
              value={form.coverImageUrl}
              onChange={(e) => updateField('coverImageUrl', e.target.value)}
            />
            <Input
              type="number"
              step="any"
              placeholder="Latitude (optionnel — détectée automatiquement)"
              value={form.latitude}
              onChange={(e) => updateField('latitude', e.target.value)}
            />
            <Input
              type="number"
              step="any"
              placeholder="Longitude (optionnel — détectée automatiquement)"
              value={form.longitude}
              onChange={(e) => updateField('longitude', e.target.value)}
            />
          </div>
          {resolvedLocation && (
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              {resolvedLocation.lat != null ? (
                <p>
                  Position détectée : {resolvedLocation.lat.toFixed(5)}, {resolvedLocation.lng.toFixed(5)}
                  {resolvedLocation.source === 'maps' && ' (depuis Google Maps)'}
                  {resolvedLocation.source === 'manual' && ' (saisie manuelle)'}
                </p>
              ) : (
                <p>
                  À l&apos;envoi, l&apos;adresse sera géolocalisée : {resolvedLocation.label}
                </p>
              )}
            </div>
          )}
        </Card>

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Spaces & tables</h2>
              <p className="mt-1 text-sm text-gray-500">
                Totals: {totals.totalCapacity} seats · {totals.totalTables} tables
              </p>
            </div>
            <Button type="button" variant="secondary" onClick={addSpace}>
              Add space
            </Button>
          </div>

          <div className="mt-4 space-y-4">
            {form.spaces.map((space, index) => (
              <div key={index} className="rounded-lg border border-gray-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">Space {index + 1}</h3>
                  {form.spaces.length > 1 && (
                    <Button type="button" variant="danger" onClick={() => removeSpace(index)}>
                      Remove
                    </Button>
                  )}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    placeholder="Space name"
                    value={space.name}
                    onChange={(e) => updateSpace(index, 'name', e.target.value)}
                    required
                  />
                  <select
                    className="rounded-lg border border-gray-300 px-4 py-2"
                    value={space.spaceType}
                    onChange={(e) => updateSpace(index, 'spaceType', e.target.value)}
                  >
                    {SPACE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Capacity"
                    value={space.capacity}
                    onChange={(e) => updateSpace(index, 'capacity', e.target.value)}
                    required
                  />
                  <Input
                    type="number"
                    min="1"
                    placeholder="Number of tables"
                    value={space.numberOfTables}
                    onChange={(e) => updateSpace(index, 'numberOfTables', e.target.value)}
                    required
                  />
                  <Input
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="Match-day price (MAD)"
                    value={space.matchDayPrice}
                    onChange={(e) => updateSpace(index, 'matchDayPrice', e.target.value)}
                    required
                  />
                  <Input
                    placeholder="Space description (optional)"
                    value={space.description}
                    onChange={(e) => updateSpace(index, 'description', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900">Media (optional)</h2>
          <p className="mt-1 text-sm text-gray-500">One image URL per line.</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <textarea
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
              rows={4}
              placeholder="Gallery image URLs"
              value={form.galleryImageUrls}
              onChange={(e) => updateField('galleryImageUrls', e.target.value)}
            />
            <textarea
              className="w-full rounded-lg border border-gray-300 px-4 py-2"
              rows={4}
              placeholder="Menu image URLs"
              value={form.menuImageUrls}
              onChange={(e) => updateField('menuImageUrls', e.target.value)}
            />
          </div>
        </Card>

        <div className="flex gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : isEdit ? 'Update & resubmit' : 'Submit for approval'}
          </Button>
          <Link to={ROUTES.OWNER_DASHBOARD}>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </section>
  );
}