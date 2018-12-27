import { stringify } from 'qs';
import request from '../../../utils/request';

export async function querySkus(params) {
  return request(`/sku/skus?${stringify(params)}`);
}

export async function querySkuInfo(params) {
  return request(`/sku/skus/${params.id}`);
}

export async function queryAutoComplete(params) {
  const keyword = params.keyword;
  let uri = `/sku/search/${params.type}`;
  if (keyword) uri += `?keyword=${keyword}`;
  return request(uri);
}

export async function updateSkuInfo(params) {
  return request(`/sku/skus/${params.id}`, {
    method: 'POST',
    body: params,
  });
}

export async function addSku(params) {
  return request(`/sku/skus`, {
    method: 'POST',
    body: params,
  });
}

export async function removeSku(params) {
  return request(`/sku/skus/${params.id}`, {
    method: 'DELETE',
  });
}

export async function queryDeleteSkus(params) {
  return request(`/sku/skus?type=deleted&${stringify(params)}`);
}

export async function restoreSku(params) {
  return request(`/sku/restore/${params.id}`, {
    method: 'POST',
    body: params,
  });
}

export async function queryStat(params) {
  return request(`/item_sku/status?${stringify(params)}`);
}

export async function querySupplier(params) {
  return request(`/supplier/suppliers?type=main&${stringify(params)}`);
}

export async function querySupplierInfo(params) {
  return request(`/supplier/suppliers/${params.id}`);
}

export async function addSupplier(params) {
  return request(`/supplier/suppliers`, {
    method: 'POST',
    body: params,
  });
}

export async function updateSupplierInfo(params) {
  return request(`/supplier/suppliers/${params.id}`, {
    method: 'POST',
    body: params,
  });
}

export async function querySupplierExist(params) {
  return request(`/supplier/exist?${stringify(params)}`);
}

export async function removeSupplier(params) {
  return request(`/supplier/suppliers/${params.id}`, {
    method: 'DELETE',
  });
}

export async function queryDeleteSuppliers(params) {
  return request(`/supplier/suppliers?type=deleted&${stringify(params)}`);
}

export async function restoreSupplier(params) {
  return request(`/supplier/restore/${params.id}`, {
    method: 'POST',
    body: params,
  });
}

export async function addSupplierSku(params) {
  return request(`/item_sku/skus`, {
    method: 'POST',
    body: params,
  });
}

export async function updateSupplierSku(params) {
  return request(`/item_sku/skus/${params.id}`, {
    method: 'POST',
    body: params,
  });
}

export async function querySupplierListing(params) {
  return request(`/supplier/suppliers?type=listing&${stringify(params)}`);
}

export async function querySupplierOrder(params) {
  // return request(`/supplier_order/orders?${stringify(params)}`);
  return request(`/order/suborders?${stringify(params)}`);
}
//
export async function querySupplierOrderBalance(params) {
  return request(`/supplier_order/balance/orders?${stringify(params)}`);
}
//
export async function querySupplierOrderInfo(params) {
  return request(`/order/suborders/${params.id}`);
}

export async function querySupplierOrderSync(params) {
  return request(`/supplier_order/orders/${params.id}/sync`, {
    method: 'POST',
    body: params,
  });
}

export async function querySupplierOrderLogistics(params) {
  return request(`/supplier_order/orders/${params.id}/track`);
}

export async function querySupplierOrderStat(params) {
  return request(`/order/suborders/total?${stringify(params)}`);
}

export async function querySupplierOrderStatus() {
  return request('/order/suborders/status');
}
//
export async function querySupplierOrderBalanceStat(params) {
  return request(`/supplier_order/balance/status?${stringify(params)}`);
}
//
export async function updateSupplierOrder(params) {
  return request(`/supplier_order/orders/${params.id}`, {
    method: 'PUT',
    body: params,
  });
}

export async function querySpu(params) {
  return request(`/spu/spus?${stringify(params)}`);
}

export async function getSpu(params) {
  return request(`/spu/spus/${params.id}`);
}

export async function addSpu(params) {
  return request(`/spu/spus`, {
    method: 'POST',
    body: params,
  });
}

export async function searchBrand(params) {
  return request(`/dict/dicts/brand/search?${stringify(params)}`);
}

export async function updateSpu(params) {
  return request(`/spu/spus/${params.id}`, {
    method: 'PUT',
    body: params,
  });
}

export async function removeSpu(params) {
  return request(`/spu/spus/${params.id}`, {
    method: 'DELETE',
  });
}

export async function removeSpus(params) {
  return request(`/spu/spus`, {
    method: 'DELETE',
    body: { id: params.id },
  });
}

export async function removeSkus(params) {
  return request(`/sku/skus`, {
    method: 'DELETE',
    body: { id: params.id },
  });
}

export async function updateSku(params) {
  return request(`/sku/skus/${params.id}`, {
    method: 'PUT',
    body: params,
  });
}

export async function searchAttr(params) {
  return request(`/dict/dicts/${params.type}/search?${stringify(params)}`);
}
