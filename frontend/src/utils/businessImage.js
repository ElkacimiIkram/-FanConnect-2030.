const CAFE_IMAGES = [
  'https://images.unsplash.com/photo-1554118811-1e0d58221f01?w=900&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=900&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=900&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=900&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=900&h=600&fit=crop&q=80',
];

const RESTAURANT_IMAGES = [
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1552566626-52f8b828add9?w=900&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=900&h=600&fit=crop&q=80',
  'https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?w=900&h=600&fit=crop&q=80',
];

const CITY_IMAGES = {
  casablanca: 'https://images.unsplash.com/photo-1569384782779-df8c9b0c2c7e?w=900&h=600&fit=crop&q=80',
  rabat: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=900&h=600&fit=crop&q=80',
  marrakech: 'https://images.unsplash.com/photo-1517824804614-40e7e1173d98?w=900&h=600&fit=crop&q=80',
  fes: 'https://images.unsplash.com/photo-1569384782779-df8c9b0c2c7e?w=900&h=600&fit=crop&q=80',
  tanger: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=900&h=600&fit=crop&q=80',
};

function hashString(value) {
  const str = String(value ?? '');
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function normalizeUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function getBusinessImageUrl(business, index = 0) {
  const cover = normalizeUrl(business?.coverImageUrl);
  if (cover) return cover;

  const gallery = business?.galleryImageUrls;
  if (Array.isArray(gallery) && gallery.length > 0) {
    const galleryUrl = normalizeUrl(gallery[index % gallery.length]);
    if (galleryUrl) return galleryUrl;
  }

  const cityKey = business?.city?.toLowerCase?.().trim();
  if (cityKey && CITY_IMAGES[cityKey]) {
    return CITY_IMAGES[cityKey];
  }

  const pool = business?.businessType === 'RESTAURANT' ? RESTAURANT_IMAGES : CAFE_IMAGES;
  const seed = `${business?.id ?? ''}-${business?.name ?? ''}-${business?.city ?? ''}`;
  return pool[hashString(seed) % pool.length];
}

export function getBusinessGalleryUrls(business, max = 4) {
  const urls = [];
  const cover = normalizeUrl(business?.coverImageUrl);
  if (cover) urls.push(cover);

  if (Array.isArray(business?.galleryImageUrls)) {
    business.galleryImageUrls.forEach((url) => {
      const normalized = normalizeUrl(url);
      if (normalized && !urls.includes(normalized)) urls.push(normalized);
    });
  }

  while (urls.length < max) {
    const fallback = getBusinessImageUrl(business, urls.length);
    if (!urls.includes(fallback)) urls.push(fallback);
    else break;
  }

  return urls.slice(0, max);
}