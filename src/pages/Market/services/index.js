import { stringify } from 'qs';
import request from '../../../utils/request';

export async function queryRoyalty(params) {
    return request(`/bd_bonus/rules?${stringify(params)}`);
}

export async function querySetRoyalty(params) {
    return request(`/bd_bonus/rules?${stringify(params)}`,{
        method: 'PUT',
        body: params,
    });
}

/*---------------------------------------------------------*/

export async function queryBonus(params) {
    return request(`/bd_bonus/stats?${stringify(params)}`)
}


