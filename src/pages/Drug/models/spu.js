/* eslint-disable prefer-destructuring */
import { message } from 'antd';
import { routerRedux } from 'dva/router';
import * as Api from '../services';

export default {
  namespace: 'spu',

  state: {
    data: {
      list: [],
      pagination: {},
    },
    spuInfo: {}
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(Api.querySpu, payload);
      console.log('fetch response:', response,payload);
      if(response.err) return message.error(response.msg)
      yield put({
        type: 'save',
        payload: {data:response},
      });
    },
    *getSpu({ payload, callback }, { call, put }) {
      const response = yield call(Api.getSpu, payload);
      if(response.err) return message.error(response.msg)
      const fields = {
        code: response.code || '',
        name: response.name || '',
        cadn: response.cadn || '',
        brand: response.brand.name || '',
        factory: response.brand.parent.name || '',
        spec: response.spec || '',
        SKUValidateStatus: true,
      }
      yield put({
        type: 'save',
        payload: {spuInfo: fields},
      });
      if(response.id && callback) callback(response)
    },
    *redirectToAdd({ payload }, { call, put }) {
      if (payload.type === 'add') {
        window.open('#/drug/list/addSpu', '新建SPU')
      } else if (payload.type === 'update') {
        const data = payload.data
        window.open(`#/drug/list/addSpu?id=${data.id}`)
      }
    },
    *removeSpu({ payload, callback }, { call, put, select }) {
      const response = yield call(Api.removeSpu, payload);
      console.log('removeSpu response',response)
      if(payload.err) message.error(payload.msg)
      const model = yield select(state => state.spu)
      const ary = payload.id.split(',')
      const data = model.data
      let page = payload.page
      if (data.page === data.pages && ary.length === data.rows.length){
        page -= 1
        if (page<=0) page = 1
      }
      const result = yield call(Api.querySpu, {page: page, rows: payload.rows});
      yield put({
        type: 'save',
        payload: {data: result},
      });
      if (callback) callback(result)
    },
    *removeSpus({ payload, callback }, { call, put, select }) {
      const response = yield call(Api.removeSpus, payload);
      console.log('removeSpu response',response)
      if(payload.err) message.error(payload.msg)
      const model = yield select(state => state.spu)
      const ary = payload.id.split(',')
      const data = model.data
      let page = payload.page
      if (data.page === data.pages && ary.length === data.rows.length){
        page -= 1
        if (page<=0) page = 1
      }
      const result = yield call(Api.querySpu, {page: page, rows: payload.rows});
      yield put({
        type: 'save',
        payload: {data: result},
      });
      if (callback) callback(result)
    },
    *searchBrand({ payload, callback }, { call, put }){
      const response = yield call(Api.searchBrand, payload);
      if(response.rows && callback) callback(response.rows)
      if(response.err) message.error(response.msg)
    },
    *addSpu({ payload, callback }, { call, put }) {
      const response = yield call(Api.addSpu, payload);
      if (response.id){
        message.success('SPU创建成功');
        yield put(routerRedux.push('/drug/list/spuList'));
      }
      if(response.err) message.error(response.msg)
    },
    *updateSpu({ payload, callback }, { call, put }){
      const response = yield call(Api.updateSpu, payload);
      console.log('updateSpu response',response)
      if (response.ret === 1){
        message.success('SPU更新成功');
        yield put(routerRedux.push('/drug/list/spuList'));
      }
      if(response.err) message.error(response.msg)
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
