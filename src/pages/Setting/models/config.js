/* eslint-disable prefer-destructuring */
import { message } from 'antd';
import { queryConfigRoots, queryConfigHKey, saveConfigValue, deleteConfig } from '../services';

export default {
  namespace: 'config',

  state: {
    hkeys: [],
    keys: [],
    hkItems: [],
    configRoots: {},
    configHKey: {},
    value: '',
  },

  effects: {
    *fetchConfigRoots(_, { call, put }) {
      const result = yield call(queryConfigRoots)
      const configRoots = result
      const hkeys = ['root:config:roots', ...Object.keys(result)]
      const hkItems = ['统一配置']
      for (const key in result) {
        const item = result[key]
        hkItems.push(item.title || key)
      }
      yield put({
        type: 'save',
        payload: {hkeys, configRoots, hkItems},
      })
    },
    *fetchConfigHKey({ payload }, { call, put }) {
      const result = yield call(queryConfigHKey, payload.hkey)
      const configHKey = result
      const keys = Object.keys(result)
      const ret = {configHKey, keys}
      if (payload.isGlobal) {
        ret.value = JSON.stringify(configHKey, null, "  ")
      }
      yield put({
        type: 'save',
        payload: ret,
      })
    },
    *fetchConfigValue({ payload }, { select, call, put }) {
      const model = yield select(state => state.config)
      const {keys, hkeys, configHKey} = model
      let result = ''
      if (payload.isGlobal) {
        result = yield call(queryConfigHKey, hkeys[payload.index])
      } else {
        result = configHKey[keys[payload.index]]
      }

      yield put({
        type: 'save',
        payload: {value: JSON.stringify(result, null, "    ")},
      })
    },
    *saveConfigValue({ payload }, { select, call, put }) {
      let value = payload.value
      try {
        value = JSON.parse(value)
      } catch (e) {
        console.log(value)
        return message.error('请输入JSON格式数据')
      }
      payload.value = value
      const result = yield call(saveConfigValue, payload)
      if (result.ret) {
        const model = yield select(state => state.config)
        const {configHKey} = model
        configHKey[payload.key] = value
        yield put({
          type: 'save',
          payload: {configHKey},
        })
        message.success('保存成功')
      } else {
        message.error('保存失败')
      }
    },
    *addConfigHKey({ payload }, { select, call, put }) {
      const model = yield select(state => state.config)
      const {hkeys, hkItems, configRoots} = model
      if (hkeys.indexOf(payload.hkey) !== -1) {
        return message.error('添加项已存在')
      }
      const result = yield call(saveConfigValue, {root:'root:config:roots', key:payload.hkey, value: {title:payload.title}})
      if (result.ret) {
        configRoots[payload.hkey] = {title:payload.title}
        hkeys.push(payload.hkey)
        hkItems.push(payload.title)
        yield put({
          type: 'save',
          payload: {hkeys, hkItems, configRoots},
        })
        message.success('添加成功')
      } else {
        message.error('添加失败')
      }
    },
    *addConfigKey({ payload }, { select, call, put }) {
      if(!payload.key) return
      const model = yield select(state => state.config)
      const {keys, configHKey} = model
      if (keys.indexOf(payload.key) !== -1) {
        return message.error('添加键已存在')
      }
      payload.value = {}
      const result = yield call(saveConfigValue, payload)
      if (result.ret) {

        configHKey[payload.key] = {}
        keys.push(payload.key)
        yield put({
          type: 'save',
          payload: {keys, configHKey},
        })
        message.success('添加成功')
      } else {
        message.error('添加失败')
      }
    },
    *deleteConfig({ payload }, { select, call, put }) {
      const model = yield select(state => state.config)
      let {keys, configHKey, hkeys, hkItems, configRoots} = model
      const result = yield call(deleteConfig, payload)
      if (result.ret) {
        let ret = {}
        if(payload.key){
          delete configHKey[payload.key]
          const index = keys.indexOf(payload.key)
          keys.splice(index, 1)
          ret = {keys, configHKey}
        }else{
          delete configRoots[payload.root]
          const index = hkeys.indexOf(payload.root)
          hkeys.splice(index, 1)
          hkItems.splice(index, 1)
          ret = {hkeys, hkItems, configRoots}
        }
        yield put({
          type: 'save',
          payload: ret,
        })
        message.success('删除成功')
      } else {
        message.error('删除失败')
      }
    },
  },

  reducers: {
    save(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    clearValue(state) {
      return {
        ...state,
        value: "",
        keys: [],
      };
    },
    changeValue(state, { payload }) {
      return {
        ...state,
        value: payload,
      };
    },
  },
};
