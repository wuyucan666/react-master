/* eslint-disable prefer-destructuring */
import { message } from 'antd';
import * as Api from '../services';

export default {
  namespace: 'recipe',

  state: {
    data: {},
  },

  effects: {
    *getList({ payload, callback }, { call, put }) {
      const result = yield call(Api.queryRecipeList, payload);
      if (!result) return;
      if (result.err) return message.error(result.msg);
      yield put({
        type: 'save',
        payload: { data: result },
      });
      callback && callback(result);
    },
    *getDetail({ payload, callback }, { call, put }) {
      const response = yield call(Api.queryRecipeDetail, payload);
      if (!response) return;
      if (response.err) return message.error(response.msg);
      yield put({
        type: 'save',
        payload: { data: response },
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
