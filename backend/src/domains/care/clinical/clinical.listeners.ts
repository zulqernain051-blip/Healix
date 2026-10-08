import { AppEventBus, EVENTS } from '../../../common/events/app-event-bus';
import { AutomaticDoctorAssignmentUseCase } from './usecases/assignment/automatic-doctor-assignment.usecase';

export function registerClinicalListeners() {
  AppEventBus.on(EVENTS.CASE_CREATED, async (payload: { caseId: string }) => {
    await new AutomaticDoctorAssignmentUseCase().execute(payload.caseId);
  });
}
