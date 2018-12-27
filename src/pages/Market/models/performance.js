/* eslint-disable prefer-destructuring */
import {message} from 'antd';
import * as Api from '../services/index';

export default {
  namespace: 'performance',

  state: {
    data: {
      list: [],
      pagination: {},
    },
    info: {}
  },

  effects: {
    *get({ payload, callback }, { call, put }) {
      const response = yield call(Api.queryBonus, payload);
      if (!response) return
      if (response.err) return message.error(response.msg)
      yield put({
        type: 'save',
        payload: {data: response},
      })
    }
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
