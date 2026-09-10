export class SchedulingPolicy {
  /** Detects overlapping time windows between a new slot and existing slots. */
  public static hasOverlappingSlot(existingSlots: any[], startTime: string, endTime: string): boolean {
    return existingSlots.some((slot: any) => {
      return startTime < slot.endTime && endTime > slot.startTime;
    });
  }
}
