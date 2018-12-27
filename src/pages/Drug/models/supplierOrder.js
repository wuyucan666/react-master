/* eslint-disable prefer-destructuring */
import { message } from 'antd';
import * as Api from '../services';

export default {
  namespace: 'supplierOrder',

  state: {
    data: {},
    orderStatus: [],
    info: {},
    stat: {},
    logistics: {},
    xiazai: {},
  },

  effects: {
    *list({ payload }, { call, put }) {
      const response = yield call(Api.querySupplierOrder, payload);
      if (!response) return;
      if (response.err) {
        message.error(response.msg);
      } else {
        yield put({
          type: 'save',
          payload: { data: response },
        });
      }
    },
    *listcheck({ payload, callback }, { call, put }) {
      const response = yield call(Api.querySupplierOrderBalance, payload);
      if (!response) return;
      if (response.err) return message.error(response.msg);
      yield put({
        type: 'save',
        payload: { data: response },
      });
      callback && callback(response);
    },
    *get({ payload }, { call, put }) {
      const response = yield call(Api.querySupplierOrderInfo, payload);
      if (!response) return;
      if (response.err) {
        message.error(response.msg);
      } else {
        yield put({
          type: 'save',
          payload: { info: response },
        });
      }
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
    *stat({ payload }, { call, put }) {
      const response = yield call(Api.querySupplierOrderStat, payload);
      if (!response) return;
      if (response.err) {
        message.error(response.msg);
      } else {
        yield put({
          type: 'save',
          payload: { stat: response },
        });
      }
    },
    *fetchOrderStatus(_, { call, put }) {
      const response = yield call(Api.querySupplierOrderStatus);
      if (!response) return;
      if (response.err) {
        message.error(response.msg);
      } else {
        const list = Object.keys(response).map(item => ({
          value: item,
          label: response[item],
        }));
        yield put({
          type: 'save',
          payload: { orderStatus: list },
        });
      }
    },
    *statcheck({ payload }, { call, put }) {
      const response = yield call(Api.querySupplierOrderBalanceStat, payload);
      if (!response) return;
      if (response.err) return message.error(response.msg);
      yield put({
        type: 'save',
        payload: { stat: response },
      });
    },
    *sync({ payload, callback }, { call, put }) {
      const response = yield call(Api.querySupplierOrderSync, payload);
      if (!response) return;
      if (response.err) return message.error(response.msg);
      const response1 = yield call(Api.querySupplierOrderInfo, payload);
      if (!response1) return;
      if (response1.err) return message.error(response1.msg);
      yield put({
        type: 'save',
        payload: { info: response1 },
      });
      callback && callback(response1);
    },
    *logistics({ payload, callback }, { call, put }) {
      const response = yield call(Api.querySupplierOrderLogistics, payload);
      if (!response) return;
      if (response.err) return message.error(response.msg);
      yield put({
        type: 'save',
        payload: { logistics: response },
      });
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
