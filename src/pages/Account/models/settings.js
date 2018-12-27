import { modifyPassword } from '../services';

export default {
  namespace: 'accountSettings',
  state: {

  },
  effects: {
    *modifyPassword({ payload }, { call }) {
      const { params } = payload;
      const data = yield call(modifyPassword, params);
      return data;
    },
  },
  reducers: {
    // save(state, { payload }) {
    //   return {
    //     ...state,
    //     ...payload,
    //   };
    // },
  },
};
