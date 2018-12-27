import { stringify } from 'qs';
import request from '../../../utils/request';

export async function queryCard(params) {
  return request(`/card/cards?${stringify(params)}`);
}

export async function addCard(params) {
  return request(`/card/cards`, {
    method: 'POST',
    body: params,
  });
}

export async function updateCard(params) {
  return request(`/card/cards/${params.id}`, {
    method: 'POST',
    body: params,
  });
}

export async function removeCard(params) {
  return request(`/card/cards/${params.id}`, {
    method: 'DELETE',
  });
}

export async function tags(params) {
  return request(`/tag/tags`);
}

export async function queryTag(params) {
  return request(`/tag/tags?${stringify(params)}`);
}

export async function removeTag(params) {
  const ids = params.ids
  return request(`/tag/tags/${ids}`, {
    method: 'DELETE',
  });
}

export async function addTag(params){
  return request(`/tag/tags`,{
    method: 'POST',
    body:params,
  })
}

export async function updateTag(params) {
  return request(`/tag/tags/${params.id}`, {
    method: 'PUT',
    body: params,
  });
}
