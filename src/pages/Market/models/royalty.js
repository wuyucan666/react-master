/* eslint-disable prefer-destructuring */
import {message} from 'antd';
import * as Api from '../services';

export default {
  namespace: 'royalty',

  state: {
    data: {},
    tags: []
  },

  effects: {
    * get({payload,callback}, {call, put}) {
      const result = yield call(Api.queryRoyalty, payload);
    //   console.log('royalty', result)
      if (!result) return
      if (result.err) return message.error(result.msg)
      yield put({
        type: 'save',
        payload: {data: result},
      });
      callback && callback(result);
    },
    * set({payload,callback}, {call, put}) {
        const result = yield call(Api.querySetRoyalty, payload);
        // console.log('royalty', result)
        if (!result) return message.error('网络异常！')
        if (result.err) return message.error(result.msg)
        yield put({
          type: 'save',
          payload: {data: result},
        });
        callback && callback(result);
    }
  },

  reducers: {
    save(state, {payload}) {
      return {
        ...state,
        ...payload,
      };
    }
  },
};
