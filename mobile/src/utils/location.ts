export function hasValidCoordinates(location: { latitude?: number | null; longitude?: number | null }): boolean {
  return typeof location.latitude === 'number' && Number.isFinite(location.latitude) && Math.abs(location.latitude) <= 90
    && typeof location.longitude === 'number' && Number.isFinite(location.longitude) && Math.abs(location.longitude) <= 180;
}
