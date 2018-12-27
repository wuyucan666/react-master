import { stringify } from 'qs';
import request from '../../../utils/request';

export async function queryOrderList(params) {
  return request(`/center/orders?${stringify(params)}`);
}

export async function queryOrderDetail(params) {
  return request(`/center/orders/${params.id}`);
}

export async function updateSupplierOrder(params) {
  return request(`/supplier_order/orders/${params.id}`, {
    method: 'PUT',
    body: params,
  });
}

export async function querySupplierOrderInfo(params) {
  return request(`/supplier_order/orders/${params.id}`);
}

export async function queryAmount() {
  return request(`/center/prescs/stat/status`);
}

export async function searchExpress(params) {
  return request(`/dict/dicts/track/search?${stringify(params)}`);
}

export async function updateAddress(params) {
  return request(`/order/orders/${params.id}/deliver`, {
    method: 'POST',
    body: params,
  });
}

export async function updateDeliver(params) {
  return request(`/order/orders/${params.id}/logistics`, {
    method: 'POST',
    body: params,
  });
}

export async function postAudit(params) {
  return request(`/order/orders/${params.id}/audit`, {
    method: 'POST',
    body: params,
  });
}

export async function cancel(params) {
  return request(`/order/orders/${params.id}/cancel`, {
    method: 'POST',
    body: params,
  });
}

export async function refundSuccess(params) {
  return request(`/order/orders/${params.id}/refunded`, {
    method: 'POST',
    body: params,
  });
}

export async function getLogistics(params) {
  return request(`/track/search?${stringify(params)}`);
}
// 对账订单列表
export async function querySupplierOrderBalance(params) {
  return request(`/supplier_order/balance/orders?${stringify(params)}`);
}
// 对账订单总计
export async function querySupplierOrderStat(params) {
  return request(`/supplier_order/balance/status?${stringify(params)}`);
}
// 对账页面筛选选项
export async function querySupplierOrderBalanceSelect(params) {
  return request(`/supplier_order/balance/options?${stringify(params)}`);
}

export async function getSupplyLogistics(params) {
  return request(`/supplier_order/orders/track?${stringify(params)}`);
}
