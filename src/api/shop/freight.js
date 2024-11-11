import request from '@/utils/request'

// 查询运费模板列表
export function listFreight(query) {
  return request({
    url: '/shop/freight/list',
    method: 'get',
    params: query
  })
}

// 查询运费模板详细
export function getFreight(id) {
  return request({
    url: '/shop/freight/' + id,
    method: 'get'
  })
}

// 新增运费模板
export function addFreight(data) {
  return request({
    url: '/shop/freight',
    method: 'post',
    data: data
  })
}

// 修改运费模板
export function updateFreight(data) {
  return request({
    url: '/shop/freight',
    method: 'put',
    data: data
  })
}

// 删除运费模板
export function delFreight(id) {
  return request({
    url: '/shop/freight/' + id,
    method: 'delete'
  })
}
