import { stringify } from 'qs'
import request from '../../../utils/request'
import { getToken } from '@/utils/authority'

export async function queryAclUsers (params) {
  return request(`/acl/users?${stringify(params)}`)
}

export async function queryAclUserInfo (params) {
  return request(`/acl/users/${params.id}`)
}

export async function addAclUser (params = {}) {
  const tokenData = getToken()
  params.creator = tokenData.id
  return request(`/acl/users`, {
    method: 'POST',
    body: params,
  })
}

export async function updateAclUserInfo (params) {
  let id = params.id
  params.id && delete params.id
  params._id = id
  return request(`/acl/users/${id}`, {
    method: 'POST',
    body: params,
  })
}

export async function removeAclUser (params) {
  return request(`/acl/users/${params.id}`, {
    method: 'DELETE',
  })
}

// 查询所有角色
export async function queryAclRoles (params) {
  return request(`/acl/roles`)
}

export async function queryUsers (params) {
  return request(`/user/users?${stringify(params)}`)
}

// 查询用户角色
export async function queryAclUserRoles (params) {
  const tokenData = getToken()
  const id = tokenData.id
  return request(`/acl/users/${id}/roles`)
}

// 查询用户资源
export async function queryAclUserResources (params) {
  const tokenData = getToken()
  const id = tokenData.id
  return request(`/acl/users/${id}/resources`)
}

// 新增角色
export async function addAclRole (params) {
  const tokenData = getToken()
  params.creator = tokenData.id
  return request(`/acl/roles`, {
    method: 'POST',
    body: params,
  })
}

// 删除角色
export async function removeAclRole (params) {
  return request(`/acl/roles/${params.id}`, {
    method: 'DELETE',
  })
}

// 更新角色信息
export async function updateAclRole (params) {
  return request(`/acl/roles/${params._id}`, {
    method: 'POST',
    body: params,
  })
}

// 更新角色资源
export async function updateAclRoleResource (params) {
  let id = params.id
  delete params.id
  return request(`/acl/roles/${id}/resource`, {
    method: 'POST',
    body: params,
  })
}

// 查询角色资源权限
export async function queryAclRoleResources (params) {
  let id = params.id
  return request(`/acl/roles/${id}/resources?${stringify(params)}`)
}

// 查询所有资源树
export async function queryAclResourceTree (params) {
  return request(`/acl/resources/tree`)
}

// 新增资源
export async function addAclResource (params) {
  return request(`/acl/resources`, {
    method: 'POST',
    body: params,
  })
}

// 更新资源
export async function updateAclResource (params) {
  return request(`/acl/resources/${params._id}`, {
    method: 'POST',
    body: params,
  })
}

// 删除资源
export async function removeAclResource (params) {
  return request(`/acl/resources/${params.id}`, {
    method: 'DELETE',
  })
}
