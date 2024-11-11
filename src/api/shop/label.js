import request from '@/utils/request'

// 查询分类列表
export function listLabel(query) {
  return request({
    url: '/shop/label/list',
    method: 'get',
    params: query
  })
}
export function listLabelByAddGoods(query) {
  return request({
    url: '/shop/label/list/goods',
    method: 'get',
    params: query
  })
}
// 查询分类详细
export function getLabel(id) {
  return request({
    url: '/shop/label/' + id,
    method: 'get'
  })
}

// 新增分类
export function addLabel(data) {
  return request({
    url: '/shop/label',
    method: 'post',
    data: data
  })
}

// 修改分类
export function updateLabel(data) {
  return request({
    url: '/shop/label',
    method: 'put',
    data: data
  })
}

// 删除分类
export function delLabel(id) {
  return request({
    url: '/shop/label/' + id,
    method: 'delete'
  })
}
