# Patient and nurse workflow changes — 2026-10-07

Requested during the module review. These are implementation changes, not an approval of the complete Patient or Nurse module and not a supervised live test result.

| Reported problem | Change | Verification still needed |
| --- | --- | --- |
| Nurse cannot distinguish listings already bid on | Marketplace listings now display the nurse's pending-offer state and have All requests, My bids and Not bid yet filters. The backend already returns each nurse only their own pending offer summaries in open listings. | Submit, update, withdraw and expire an offer with a disposable nurse account; confirm filter transitions. |
| Patient offer details are hard to compare by nurse | Offer review groups cards by nurse and orders groups by their comparison score. Each nurse's submitted offers stay together. | Compare multiple nurses and repeated offers on one listing. |
| Detail pages lose bottom tabs and some have no way back | Patient and nurse root stacks now provide a Back control and persistent role navigation below non-tab detail screens; the original tab bar remains on primary tabs. | Walk through nested screens on Expo web and native sizes, including direct deep links. |
| Check-in and visit labels show strange symbols | Replaced literal question-mark placeholders and decorative characters in key visit labels/buttons with plain text. | Inspect check-in, verification, start visit and completed visit on a real device and browser. |
| Visit appears late after dual contract approval | The server creates the visit asynchronously from a `CONTRACT_ACTIVATED` outbox event (worker checks every five seconds). Nurse visits and patient care requests now refresh every five seconds; active contract screens explain the short preparation period and link to visit lists. | Complete dual approval and measure actual time to visit on both accounts; investigate outbox errors if it exceeds the expected short delay. |
| Patient cannot find QR code | The existing patient visit detail generates/displays the QR for the nurse to scan. Care screen, care card, request detail and visit list now call out that path explicitly. The nurse's visit detail has the QR scanner. | Verify QR token generation, camera permission, scan and fallback methods live. |

The patient displays the visit QR; the nurse scans it. This preserves the existing verification direction rather than adding a patient camera scanner without a corresponding nurse code.

Validation completed: Expo TypeScript `tsc --noEmit` passed, and an Expo web export bundled and statically rendered 183 routes. These checks do not establish that a live dual-account contract, camera scan or native-device navigation works; those remain for the supervised run.
