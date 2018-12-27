/* eslint-disable prefer-destructuring */
import { message } from 'antd';
import { queryTag, removeTag, addTag, updateTag } from '../services/index';

export default {
  namespace: 'Tag',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryTag, payload);
      console.log('fetch response:', response);
      yield put({
        type: 'save',
        payload: {data:response},
      });
    },
    *add({ payload, callback }, { call, put }) {
      const response = yield call(addTag, payload);
      console.log('response is --',response)
      const result = yield call(queryTag,{page:payload.page,rows:payload.rows});
      yield put({
        type: 'save',
        payload: {data:result},
      });
      if (callback) callback(response)
    },
    *update({payload}, {call, put}) {
      const response = yield call(updateTag, payload);
      const result = yield call(queryTag,{page:payload.page,rows:payload.rows});
      yield put({
        type: 'save',
        payload: {data:result},
      });
      message.success('更新成功');
    },
    *remove({ payload, callback }, { select, call, put }) {
      const response = yield call(removeTag, payload);
      // const result = yield call(queryTag,{page:payload.page,rows:payload.rows});
      const model = yield select(state => state.Tag)
      console.log(model)
      const ary = payload.ids.split(',')
      const data = model.data
      let page = payload.page
      if (data.page === data.pages && ary.length === data.rows.length){
        --page
        if (page<=0) page = 1
      }
      const result = yield call(queryTag, {page: page, rows: payload.rows});

      yield put({
        type: 'save',
        payload: {data:result},
      });
      if (callback) callback(result);
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
