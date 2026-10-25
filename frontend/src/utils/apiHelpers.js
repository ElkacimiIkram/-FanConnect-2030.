export function getApiData(response) {
  return response?.data?.data ?? null;
}

export function getApiMessage(response) {
  return response?.data?.message ?? '';
}

const FIELD_LABELS = {
  name: 'Name',
  businessType: 'Business type',
  description: 'Description',
  country: 'Country',
  city: 'City',
  address: 'Address',
  googleMapsUrl: 'Google Maps URL',
  coverImageUrl: 'Cover image URL',
  contactPhone: 'Phone',
  contactEmail: 'Email',
  totalCapacity: 'Total capacity',
  totalTables: 'Total tables',
  spaces: 'Spaces',
};

function formatValidationErrors(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return '';
  }

  const entries = Object.entries(data);
  if (entries.length === 0) {
    return '';
  }

  return entries
    .map(([field, message]) => {
      const label = FIELD_LABELS[field] || field;
      return `${label}: ${message}`;
    })
    .join(' · ');
}

export function getApiError(error) {
  const body = error?.response?.data;
  const validationDetails = formatValidationErrors(body?.data);

  if (validationDetails) {
    return `${body?.message || 'Validation failed'} — ${validationDetails}`;
  }

  return body?.message || error?.message || 'An unexpected error occurred';
}