import { stringify } from 'qs';
import request from '../../../utils/request';

export async function queryFeedback(params) {
  return request(`/feedback/feedbacks?${stringify(params)}`);
}

export async function queryFeedbackInfo(params) {
  return request(`/feedback/feedbacks/${params.id}`);
}

export async function updateFeedback(params) {
  return request(`/feedback/feedbacks/${params.id}`, {
    method: 'POST',
    body: params,
  });
}

export async function queryAmount() {
  return request(`/feedback/status`);
}

export async function queryFeedbackAdjoin(params) {
  return request(`/feedback/adjoin/${params.id}?flag=-1`);
}
