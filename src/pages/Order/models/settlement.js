// import { message } from 'antd';
// import * as Api from '../services/index';

export default {
  namespace: 'orderSettlement',

  state: {
    list: [],
  },

  effects: {
    *fetchList({ payload = {} }, { call, put }) {
      const { page = 1, pageSize = 10, type = 'a' } = payload;
      console.log(page, pageSize, type);
      const data = [
        {
          key: '1',
          name: '胡彦斌',
          age: 32,
          address: '西湖区湖底公园1号',
        },
        {
          key: '2',
          name: '胡彦祖',
          age: 42,
          address: '西湖区湖底公园1号',
        },
      ];
      yield put({
        type: 'save',
        payload: { list: data },
      });
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
