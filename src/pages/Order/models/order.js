/* eslint-disable prefer-destructuring */
import { message } from 'antd';
import * as Api from '../services/index';

export default {
  namespace: 'order',

  state: {
    data: {},
    info: {},
    stat: {},
    status: {},
  },

  effects: {
    *getList({ payload, callback }, { call, put }) {
      const result = yield call(Api.queryOrderList, payload);
      if (!result) return;
      if (result.err) return message.error(result.msg);
      yield put({
        type: 'save',
        payload: { data: result },
      });
      callback && callback(result);
    },
    *getDetail({ payload, callback }, { call, put }) {
      const result = yield call(Api.queryOrderDetail, payload);
      if (!result) return;
      if (result.err) return message.error(result.msg);
      yield put({
        type: 'save',
        payload: { data: result },
      });
      callback && callback(result);
    },
    *update({ payload, callback }, { call, put }) {
      const response = yield call(Api.updateSupplierOrder, payload);
      if (!response) return message.error('保存失败');
      if (response.err) return message.error(response.msg);
      const response1 = yield call(Api.querySupplierOrderInfo, payload);
      if (!response1) return message.error('保存失败');
      if (response1.err) return message.error(response1.msg);
      yield put({
        type: 'save',
        payload: { info: response1 },
      });
      callback && callback(response1);
      message.success('保存成功');
    },
    *fetch({ payload }, { call, put }) {
      const response = yield call(Api.queryOrder, payload);
      const response2 = yield call(Api.queryAmount);
      if (!response || !response2) return;
      if (response && response.err) return message.error(response.msg);
      if (response2 && response2.err) return message.error(response2.msg);
      const result = Object.assign(response, response2);
      yield put({
        type: 'save',
        payload: { data: result },
      });
    },
    *listcheck({ payload, callback }, { call, put }) {
      const response = yield call(Api.querySupplierOrderBalance, payload);
      if (!response) return;
      if (response.err) return message.error(response.msg);
      yield put({
        type: 'save',
        payload: { data: response },
      });
    },
    *stat({ payload }, { call, put }) {
      const response = yield call(Api.querySupplierOrderStat, payload);
      if (!response) return;
      if (response.err) return message.error(response.msg);
      yield put({
        type: 'save',
        payload: { stat: response },
      });
    },
    *selectcheck({ payload }, { call, put }) {
      const response = yield call(Api.querySupplierOrderBalanceSelect, payload);
      if (!response) return;
      if (response.err) return message.error(response.msg);
      yield put({
        type: 'save',
        payload: { status: response },
      });
    },
    *audit({ payload, callback }, { call, put }) {
      const response = yield call(Api.postAudit, payload);
      if (!response) return;
      if (response && response.err) return message.error(response.msg);
      callback && callback(response);
    },
    *searchExpress({ payload, callback }, { call, put }) {
      const response = yield call(Api.searchExpress, payload);
      if (!response) return;
      if (response && response.err) return message.error(response.msg);
      callback && callback(response);
    },
    *updateAddress({ payload, callback }, { call, put }) {
      const response = yield call(Api.updateAddress, payload);
      if (!response) return;
      if (response && response.err) return message.error(response.msg);
      callback && callback(response);
    },
    *updateDeliver({ payload, callback }, { call, put }) {
      const response = yield call(Api.updateDeliver, payload);
      if (!response) return;
      if (response && response.err) return message.error(response.msg);
      callback && callback(response);
    },
    *cancel({ payload, callback }, { call, put }) {
      const response = yield call(Api.cancel, payload);
      if (!response) return;
      if (response && response.err) return message.error(response.msg);
      callback && callback(response);
    },
    *refundSuccess({ payload, callback }, { call, put }) {
      const response = yield call(Api.refundSuccess, payload);
      if (!response) return;
      if (response && response.err) return message.error(response.msg);
      callback && callback(response);
    },
    *getLogistics({ payload, callback }, { call, put }) {
      const response = yield call(Api.getLogistics, payload);
      if (!response) return;
      if (response && response.err) return message.error(response.msg);
      callback && callback(response);
    },
    *getSupplyLogistics({ payload, callback }, { call, put }) {
      const response = yield call(Api.getSupplyLogistics, payload);
      if (!response) return;
      if (response && response.err) return message.error(response.msg);
      callback && callback(response);
    },
  },

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
