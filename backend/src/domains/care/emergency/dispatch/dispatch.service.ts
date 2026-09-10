import { AppError } from '../../../../common/errors/AppError';
import { HTTP_STATUS } from '../../../../common/constants/index';
import { DispatchRepository } from './dispatch.repository';

function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export class DispatchService {
  static async recommendHospitals(patientId: string, latitude: number, longitude: number) {
    const patient = await DispatchRepository.findPatientById(patientId);

    if (!patient) {
      throw new AppError('', HTTP_STATUS.NOT_FOUND);
    }

    // Affordability tier of patient: default to LOW if not set
    // In our DB, we can default or fetch from chronic conditions / settings. Let's assume a default profile tier.
    const patAffordability = 'LOW'; // In a real system, fetched from profile income brackets.

    // Retrieve all hospitals
    const hospitals = await DispatchRepository.findAllHospitals();
    const now = new Date();

    // Map and score distances
    let filtered = hospitals.map(h => {
      const distance = getDistanceKm(latitude, longitude, h.latitude, h.longitude);
      const isStale = (now.getTime() - h.capacityUpdatedAt.getTime()) > 30 * 60 * 1000;
      return {
        ...h,
        distance,
        staleCapacityWarning: isStale
      };
    });

    // Affordability Filter logic:
    // Exclude hospitals that exceed patient affordability tier
    // Low: can only see LOW or Charity
    // Medium: can see LOW, MEDIUM, or Charity
    // High: can see any
    let passesAffordability = filtered.filter(h => {
      if (h.isCharity) return true;
      if (patAffordability === 'LOW') return h.affordabilityTier === 'LOW';
      if (patAffordability === 'MEDIUM') return h.affordabilityTier === 'LOW' || h.affordabilityTier === 'MEDIUM';
      return true;
    });

    // If zero pass within 25km, surface government/charity fallback tier
    const nearbyAffordable = passesAffordability.filter(h => h.distance <= 25);
    if (nearbyAffordable.length === 0) {
      // Fallback: government/charity hospitals
      passesAffordability = filtered.filter(h => h.isCharity || h.affordabilityTier === 'LOW');
    } else {
      passesAffordability = passesAffordability.filter(h => h.distance <= 25);
    }

    // Sort by distance
    return passesAffordability.sort((a, b) => a.distance - b.distance);
  }

  static async triggerAmbulanceDispatch(patientId: string, hospitalId: string, triggeredByUserId: string) {
    const hospital = await DispatchRepository.findHospitalById(hospitalId);

    if (!hospital) {
      throw new AppError('', HTTP_STATUS.NOT_FOUND);
    }

    // Affordability Check verification before external API call
    const patAffordability = 'LOW';
    if (!hospital.isCharity && patAffordability === 'LOW' && hospital.affordabilityTier !== 'LOW') {
      throw new AppError('', HTTP_STATUS.FORBIDDEN);
    }

    // Create ambulance dispatch record
    const dispatch = await DispatchRepository.createDispatch(patientId, hospitalId, triggeredByUserId, 12);

    return dispatch;
  }

  static async getDispatchTracking(dispatchId: string) {
    const dispatch = await DispatchRepository.findDispatchWithDetails(dispatchId);

    if (!dispatch) {
      throw new AppError('', HTTP_STATUS.NOT_FOUND);
    }

    // Simulate real-time progress based on ETA countdown
    const elapsedMinutes = Math.floor((Date.now() - dispatch.dispatchedAt.getTime()) / (60 * 1000));
    const liveEta = Math.max(0, dispatch.etaMinutes - elapsedMinutes);

    return {
      id: dispatch.id,
      status: liveEta === 0 ? 'ARRIVED' : dispatch.status,
      etaMinutes: liveEta,
      destinationHospital: dispatch.hospital.name,
      paramedicContact: '+923001234567',
      paramedicName: 'Raza Paramedic'
    };
  }
}
