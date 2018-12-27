import { stringify } from 'qs';
import request from '../../../utils/request';

export async function queryRecipeList(params) {
  return request(`/presc/prescs?${stringify(params)}`);
}
export async function queryRecipeDetail(params) {
  return request(`/presc/prescs/${params.id}`);
}
