/* eslint-disable prefer-destructuring */
import { message, Modal } from 'antd';
import * as Api from '../services';

export default {
  namespace: 'sku',

  state: {
    data: {
    },
    info: {},
    autoData: {},
    delData: {},
    stat: {},
  },

  effects: {
    *list({ payload, callback }, { call, put }) {
      const response = yield call(Api.querySkus, payload);
      if (!response) return
      if (response.err) return message.error(response.msg)
      yield put({
        type: 'save',
        payload: {data: response},
      });
      callback && callback(response)
    },
    *listDelete({ payload, callback }, { call, put }) {
      const response = yield call(Api.queryDeleteSkus, payload);
      if (!response) return
      if (response.err) return message.error(response.msg)
      yield put({
        type: 'save',
        payload: {delData: response},
      });
      callback && callback(response)
    },
    *get({ payload, callback }, { call, put }) {
      const response = yield call(Api.querySkuInfo, payload);
      if (!response) return
      if (response.err) return message.error(response.msg)
      yield put({
        type: 'save',
        payload: {info: response},
      });
      callback && callback(response)
    },
    *autoComplete({ payload }, { call, put }) {
      const response = yield call(Api.queryAutoComplete, payload);
      if (!response) return
      if (response.err) return message.error(response.msg)
      yield put({
        type: 'save',
        payload: {autoData: response},
      });
    },
    *update({ payload, callback }, { call, put }) {
      const response = yield call(Api.updateSkuInfo, payload);
      if (!response) return message.error('修改失败')
      if (response.err) return message.error(response.msg)
      const response1 = yield call(Api.querySkuInfo, payload);
      if (!response1) return message.error('修改失败')
      if (response1.err) return message.error(response1.msg)
      yield put({
        type: 'save',
        payload: {info: response1},
      });
      callback && callback(response1)
      message.success('修改成功')
    },
    *add({ payload, callback }, { call, put }) {
      const response = yield call(Api.addSku, payload)
      if (!response) return message.error('创建失败')
      if (response.err) return message.error(response.msg)
      callback && callback(response)
      message.success('创建成功')
    },
    *remove({ payload, callback }, { call, put }){
      const response = yield call(Api.removeSku, payload)
      if (!response) return message.error('删除失败')
      if(response.err){
        if (response.err === 3010) {
          return Modal.warning({
            title: '不能删除此SKU!',
            content: response.msg,
          })
        }
        message.error(response.msg)
        return
      }
      const response1 = yield call(Api.querySkus, payload);
      if (!response1) return message.error('删除失败')
      if (response1.err) return message.error(response1.msg)
      yield put({
        type: 'save',
        payload: {data: response1},
      });
      if (response.ret > 0){
        callback && callback(response)
        message.success('删除成功');
      }
    },
    *restore({ payload, callback }, { call, put }) {
      const response = yield call(Api.restoreSku, payload)
      if (!response) return message.error('恢复失败')
      if (response.err) return message.error(response.msg)
      const response1 = yield call(Api.queryDeleteSkus, payload);
      if (!response1) return message.error('恢复失败')
      if (response1.err) return message.error(response1.msg)
      yield put({
        type: 'save',
        payload: {delData: response1},
      });
      callback && callback(response)
      message.success('恢复成功')
    },
    *stat({ payload }, { call, put }) {
      const response = yield call(Api.queryStat, payload);
      if (!response) return
      if (response.err) return message.error(response.msg)
      yield put({
        type: 'save',
        payload: {stat: response},
      });
    },
  },

  reducers: {
    save(state, {payload}) {
      return {
        ...state,
        ...payload,
      }
    },
  },
};
