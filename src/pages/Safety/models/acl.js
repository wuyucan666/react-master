/* eslint-disable prefer-destructuring */
import { message } from 'antd';
import * as Api from '../services';

export default {
  namespace: 'acl',

  state: {
    userList: {},
    users: {},
    roles: [],
    userInfo: {},
    userRoles: {},
    perRoles: [],
    resourceTree: [],
    resourcePer: {},
  },

  effects: {
    *queryAclUsers({ payload, callback }, { call, put }) {
      const response = yield call(Api.queryAclUsers, payload);
      if (!response) return
      if (response.err) return message.error(response.msg)
      yield put({
        type: 'save',
        payload: {userList: response},
      });
      callback && callback(response)
    },
    *queryAclRoles({ payload, callback }, { call, put }) {
      const response = yield call(Api.queryAclRoles, payload);
      if (!response) return
      if (response.err) return message.error(response.msg)
      let roles = response.rows || [];
      yield put({
        type: 'save',
        payload: {roles},
      });
      callback && callback(roles)
    },
    *queryAclUserInfo({ payload, callback }, { call, put }) {
      const response = yield call(Api.queryAclUserInfo, payload);
      if (!response) return
      if (response.err) return message.error(response.msg)
      yield put({
        type: 'save',
        payload: {userInfo: response},
      });
      callback && callback(response)
    },
    *addAclUser({ payload, callback }, { call, put }) {
      const response = yield call(Api.addAclUser, payload)
      if (!response) return message.error('创建失败')
      if (response.err) return message.error(response.msg)
      callback && callback(response)
      message.success('创建成功')
    },
    *updateAclUserInfo({ payload, callback }, { call, put }) {
      const id = payload.id
      const response = yield call(Api.updateAclUserInfo, payload);
      if (!response) return message.error('修改失败')
      if (response.err) return message.error(response.msg)
      const response1 = yield call(Api.queryAclUserInfo, {id});
      if (!response1) return message.error('修改失败')
      if (response1.err) return message.error(response1.msg)
      yield put({
        type: 'save',
        payload: {userInfo: response1},
      });
      callback && callback(response1)
      message.success('修改成功')
    },
    *removeAclUser({ payload, callback }, { call, put }){
      const response = yield call(Api.removeAclUser, payload)
      if (!response) return message.error('删除失败')
      if(response.err){
        message.error(response.msg)
        return
      }
      const response1 = yield call(Api.queryAclUsers, payload);
      if (!response1) return message.error('删除失败')
      if (response1.err) return message.error(response1.msg)
      yield put({
        type: 'save',
        payload: {userList: response1},
      });
      if (response.ret > 0){
        callback && callback(response)
        message.success('删除成功');
      }
    },
    *queryUsers({ payload, callback }, { call, put }) {
      const response = yield call(Api.queryUsers, payload);
      if (!response) return
      if (response.err) return message.error(response.msg)
      yield put({
        type: 'save',
        payload: {users: response},
      });
      callback && callback(response)
    },
    *queryAclUserRoles({ payload, callback }, { call, put }) {
      const response = yield call(Api.queryAclUserRoles, payload);
      if (!response) return
      if (response.err) return message.error(response.msg)
      yield put({
        type: 'save',
        payload: {userRoles: response},
      });
      callback && callback(response)
    },
    *queryAclUserPerRoles({ payload, callback }, { call, put }) {
      const userRoles = yield call(Api.queryAclUserRoles, payload);
      if (!userRoles) return
      if (userRoles.err) return message.error(userRoles.msg)
      const result = yield call(Api.queryAclRoles, payload);
      if (!result) return
      if (result.err) return message.error(result.msg)
      let roles = result.rows || [];
      const perRoles = [];
      roles.forEach(function (item) { // 先增加自身没有的角色
        if(!userRoles[item.code]){
          perRoles.push(item);
        }
      });
      for (let key in userRoles) { // 再增加自身的角色
        if (key !== 'root') {
          perRoles.unshift(userRoles[key])
        }
      }
      yield put({
        type: 'save',
        payload: {userRoles, perRoles},
      });
      callback && callback(perRoles)
    },
    *queryAclResourcePer({ payload, callback }, { call, put }) {
      const response = yield call(Api.queryAclRoleResources, payload);
      if (!response) return
      if (response.err) return message.error(response.msg)
      yield put({
        type: 'save',
        payload: {resourcePer: response},
      });
      callback && callback(response)
    },
    *queryAclResourceTree({ payload, callback }, { call, put }) {
      const response = yield call(Api.queryAclResourceTree, payload);
      if (!response) return
      if (response.err) return message.error(response.msg)
      let rows = response.rows || []
      yield put({
        type: 'save',
        payload: {resourceTree: rows},
      });
      callback && callback(rows)
    },
    *addAclRole({ payload, callback }, { call, put }) {
      const response = yield call(Api.addAclRole, payload);
      if (!response) return
      if (response.err) return message.error(response.msg)
      message.success('创建成功');
      payload._id = response._id
      callback && callback(payload)
    },
    *updateAclRole({ payload, callback }, { call, put }) {
      const response = yield call(Api.updateAclRole, payload);
      if (!response) return
      if (response.err) return message.error(response.msg)
      message.success('更新成功');
      callback && callback(payload)
    },
    *removeAclRole({ payload, callback }, { call, put }) {
      const response = yield call(Api.removeAclRole, payload);
      if (!response) return
      if (response.err) return message.error(response.msg)
      message.success('删除成功');
      callback && callback(payload)
    },
    *updateAclRoleResource({ payload, callback }, { call, put }) {
      const response = yield call(Api.updateAclRoleResource, payload);
      if (!response) return
      if (response.err) return message.error(response.msg)
      message.success('更新成功');
      callback && callback(payload)
    },
    *addAclResource({ payload, callback }, { call, put }) {
      const response = yield call(Api.addAclResource, payload);
      if (!response) return
      if (response.err) return message.error(response.msg)
      message.success('创建成功');
      callback && callback(response)
    },
    *updateAclResource({ payload, callback }, { call, put }) {
      const response = yield call(Api.updateAclResource, payload);
      if (!response) return
      if (response.err) return message.error(response.msg)
      message.success('更新成功');
      callback && callback(payload)
    },
    *removeAclResource({ payload, callback }, { call, put }) {
      const response = yield call(Api.removeAclResource, payload);
      if (!response) return
      if (response.err) return message.error(response.msg)
      message.success('删除成功');
      callback && callback(payload)
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
