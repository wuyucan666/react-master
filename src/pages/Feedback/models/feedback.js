/* eslint-disable prefer-destructuring */
import { message } from 'antd';
import * as Api from '../services';

export default {
  namespace: 'feedback',

  state: {
    data: {},
    item: {},
    stat: {},
  },

  effects: {
    * list({payload}, {call, put}) {
      const result = yield call(Api.queryFeedback, payload);
      const response = yield call(Api.queryAmount);
      if (!result || result.err) return
      if (!response || response.err) return
      yield put({
        type: 'save',
        payload: {data: result, stat: response},
      });
    },
    * detail({payload, callback}, {select, call, put}) {
      const result = yield call(Api.queryFeedbackInfo, payload);
      if (!result || result.err) return
      yield put({
        type: 'save',
        payload: {item: result},
      });
      if(callback) {
        callback(result)
      }
    },
    * update({payload, callback}, {select, call, put}) {
      const response = yield call(Api.updateFeedback, payload);
      if (!response || response.err) return message.error('保存失败');
      const model = yield select(state => state.feedback)
      let item = model.item
      if (payload.memo) item.memo = payload.memo
      if (payload.status != undefined) item.status = payload.status
      yield put({
        type: 'save',
        payload: {item: item},
      })
      if(callback) {
        callback(response)
      }
      message.success('保存成功');
    },
    * prev({payload, callback}, {select, call, put}) {
      const result = yield call(Api.queryFeedbackAdjoin, payload);
      if (!result || result.err) return
      if (result.last) {
        message.error('这已经是最后一条反馈了');
        return
      }
      yield put({
        type: 'save',
        payload: {item: result},
      });
      if(callback) {
        callback(result)
      }
    },
  },

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    }
  },
};
