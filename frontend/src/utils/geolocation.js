export function requestUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('La géolocalisation n\'est pas supportée par votre navigateur.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        const messages = {
          1: 'Autorisez l\'accès à votre position pour voir les cafés à proximité.',
          2: 'Position indisponible. Réessayez plus tard.',
          3: 'Délai dépassé lors de la recherche de position.',
        };
        reject(new Error(messages[error.code] || 'Impossible d\'obtenir votre position.'));
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  });
}