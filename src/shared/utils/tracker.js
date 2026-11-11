// Derives Claims-Ready tracker state from a submission's ack count.
import {payerById} from '../../data/payers.js';
import {SLA_HOURS} from '../constants/index.js';

const LAG = {northwind: 0, summit: 0, bluewater: 1}; // Bluewater's ack files arrive one cycle later

export function payerStage(submission, payerId) {
  return Math.max(1, Math.min(4, 1 + submission.ackCount - LAG[payerId]));
}

export function stageTimes(submission, payerId) {
  const {ackHours} = payerById[payerId];
  const stage = payerStage(submission, payerId);
  return ackHours.map((h, i) => (i <= stage ? submission.submittedAt + h * 3600e3 : null));
}

export function slaInfo(submission, payerId) {
  const stage = payerStage(submission, payerId);
  const elapsed = payerById[payerId].ackHours[stage];
  const live = stage === 4;
  return {elapsed, live, remaining: SLA_HOURS - elapsed, met: elapsed <= SLA_HOURS};
}
