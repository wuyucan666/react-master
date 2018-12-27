/* eslint-disable prefer-destructuring */
import {message} from 'antd';
import * as Api from '../services';

export default {
  namespace: 'KnowledgeCard',

  state: {
    data: {},
    tags: []
  },

  effects: {
    * list({payload}, {call, put}) {
      const result = yield call(Api.queryCard, payload);
      console.log('KnowledgeCard', result)
      if (!result) return
      yield put({
        type: 'save',
        payload: {data: result},
      });
    },
    * create({payload}, {call, put}) {
      const response = yield call(Api.addCard, payload);
      if (response.err) return message.error('添加失败');
      const result = yield call(Api.queryCard,{page:payload.page, rows:payload.rows});
      yield put({
        type: 'save',
        payload: {data: result},
      });
      message.success('添加成功');
    },
    * update({payload}, {call, put}) {
      const response = yield call(Api.updateCard, payload);
      if (response.err) return message.error('更新失败');
      const result = yield call(Api.queryCard, {page: payload.page, rows: payload.rows});
      yield put({
        type: 'save',
        payload: {data: result},
      });
      message.success('更新成功');
    },
    * remove({payload, callback}, {select, call, put}) {
      const response = yield call(Api.removeCard, payload);
      if (response.err) return message.error('删除失败');
      const model = yield select(state => state.KnowledgeCard)
      const ary = payload.id.split(',')
      const data = model.data
      let page = payload.page
      if (data.page === data.pages && ary.length === data.rows.length){
        --page
        if (page<=0) page = 1
      }
      const result = yield call(Api.queryCard, {page: page, rows: payload.rows});
      yield put({
        type: 'save',
        payload: {data: result},
      });
      callback && callback(result)
    },
    * tags({payload}, {call, put}) {
      const result = yield call(Api.tags, payload);
      console.log('tags', result)
      if (!result) return

      yield put({
        type: 'save',
        payload: {tags: result.rows},
      });
    },
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
