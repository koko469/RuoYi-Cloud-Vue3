import request from '@/utils/request'

// 查询优惠券关联列表
export function listRelation(query) {
  return request({
    url: '/shop/relation/list',
    method: 'get',
    params: query
  })
}
// 查询优惠券关联ids列表
export function listIds(query) {
  return request({
    url: '/shop/relation/idsList',
    method: 'get',
    params: query
  })
}
// 查询优惠券关联详细
export function getRelation(id) {
  return request({
    url: '/shop/relation/' + id,
    method: 'get'
  })
}

// 新增优惠券关联
export function addRelation(data) {
  return request({
    url: '/shop/relation',
    method: 'post',
    data: data
  })
}

// 修改优惠券关联
export function updateRelation(data) {
  return request({
    url: '/shop/relation',
    method: 'put',
    data: data
  })
}

// 删除优惠券关联
export function delRelation(id) {
  return request({
    url: '/shop/relation/' + id,
    method: 'delete'
  })
}
// 添加多个优惠券关联
export function addByIds(data) {
  return request({
    url: '/shop/relation/ids',
    method: 'put',
    data: data
  })
}