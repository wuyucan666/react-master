/* eslint-disable prefer-destructuring */
import { message, Modal } from 'antd';
import * as Api from '../services';

export default {
  namespace: 'supplier',

  state: {
    data: {},
    listing: {},
    info: {},
    delData: {},
    stat: {},
  },

  effects: {
    *list({ payload }, { call, put }) {
      const response = yield call(Api.querySupplier, payload);
      if (!response) return
      if (response.err) return message.error(response.msg)
      yield put({
        type: 'save',
        payload: {data: response},
      });
    },
    *listDelete({ payload, callback }, { call, put }) {
      const response = yield call(Api.queryDeleteSuppliers, payload);
      if (!response) return
      if (response.err) return message.error(response.msg)
      yield put({
        type: 'save',
        payload: {delData: response},
      });
      callback && callback(response)
    },
    *listing({ payload, callback }, { call, put }) {
      const response = yield call(Api.querySupplierListing, payload);
      if (!response) return
      if (response.err) return message.error(response.msg)
      yield put({
        type: 'save',
        payload: {listing: response},
      });
      callback && callback(response)
    },
    *get({ payload, callback }, { call, put }) {
      const response = yield call(Api.querySupplierInfo, payload);
      if (!response) return
      if (response.err) return message.error(response.msg)
      yield put({
        type: 'save',
        payload: {info: response},
      });
      callback && callback(response)
    },
    *update({ payload, callback }, { call, put }) {
      const response = yield call(Api.updateSupplierInfo, payload);
      if (!response) return message.error('修改失败')
      if (response.err) return message.error(response.msg)
      const response1 = yield call(Api.querySupplierInfo, payload);
      if (!response1) return message.error('修改失败')
      if (response1.err) return message.error(response.msg)
      yield put({
        type: 'save',
        payload: {info: response1},
      });
      callback && callback(response1)
      message.success('修改成功')
    },
    *add({ payload, callback }, { call, put }) {
      const response = yield call(Api.addSupplier, payload)
      if (!response) return message.error('创建失败')
      if (response.err) return message.error(response.msg)
      const response1 = yield call(Api.querySupplier,{page:payload.page, rows:payload.rows});
      if (!response1) return message.error('创建失败')
      if (response1.err) return message.error(response1.msg)
      yield put({
        type: 'save',
        payload: {data: response1},
      })
      callback && callback(response)
      message.success('创建成功')
    },
    *remove({ payload, callback }, { call, put }){
      const response = yield call(Api.removeSupplier, payload)
      if (!response) return message.error('删除失败')
      if(response.err){
        if (response.err === 3009) {
          return Modal.warning({
            title: '不能删除此供货商!',
            content: response.msg,
          })
        }
        message.error(response.msg)
        return
      }
      const response1 = yield call(Api.querySupplier, payload);
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
      const response = yield call(Api.restoreSupplier, payload)
      if (!response) return message.error('恢复失败')
      if (response.err) return message.error(response.msg)
      const response1 = yield call(Api.queryDeleteSuppliers, payload);
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
    *exist({ payload, callback }, { call, put }) {
      const response = yield call(Api.querySupplierExist, payload)
      if (!response) return
      if (response.err){
        if (response.err === 3008 || response.err === 3011){
          callback && callback(true)
          return
        }
        callback && callback(false)
        return message.error(response.msg)
      }
      callback && callback(false)
    },
    *saveSku({ payload, callback }, { call, put }) {
      let apiFun = Api.addSupplierSku
      if (payload.id) apiFun = Api.updateSupplierSku
      const response = yield call(apiFun, payload)
      if (!response) return message.error('保存失败')
      if (response.err) return message.error(response.msg)
      callback && callback(response)
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
