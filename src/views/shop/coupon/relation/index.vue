<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="名字" prop="name">
        <el-input
            v-model="queryParams.name"
            placeholder="请输入名字"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['shop:relation:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['shop:relation:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="relationList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="id" align="center" prop="id" />
      <el-table-column v-if="route.params.scope == 1" label="商品名字" align="center" prop="name" />
      <el-table-column v-else-if="route.params.scope == 2" label="类别名字" align="center" prop="name" />
      <el-table-column v-else label="商家名称" align="center" prop="name" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['shop:relation:remove']">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改优惠券关联对话框 -->
    <el-dialog :title="title" v-model="open" width="1200px" append-to-body >
      <el-form ref="relationRef" :model="form" :rules="rules" label-width="80px" >
        <el-table v-loading="loading" :data="idsList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="id" align="center" prop="id" />
          <el-table-column  label="名称" align="center" prop="name" />
          <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-button link type="primary" @click="addIds(scope.row)" v-hasPermi="['shop:relation:add']">添加</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination
            v-show="idsTotal>0"
            :total="idsTotal"
            v-model:page="idsQueryParams.pageNum"
            v-model:limit="idsQueryParams.pageSize"
            @pagination="getIdsList"
            class="dialog"
        />
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Relation">
import { listRelation, getRelation, delRelation, addRelation, updateRelation,listIds,addByIds } from "@/api/shop/relation";
import { useRoute } from 'vue-router'
const { proxy } = getCurrentInstance();

const route = useRoute()
const relationList = ref([]);
const idsList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const idsTotal = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: null,
    couponId: route.params.id,
    id: null
  },

  idsQueryParams: {
    pageNum: 1,
    pageSize: 10,
    couponId: route.params.id,
    id: null
  },
  rules: {
    type: [
      { required: true, message: "关联类型：1商品，2类别，3商家不能为空", trigger: "change" }
    ],
    ids: [
      { required: true, message: "关联的id不能为空", trigger: "blur" }
    ]
  }
});

const { queryParams, form, rules,idsQueryParams } = toRefs(data);

/** 查询优惠券关联列表 */
function getList() {
  loading.value = true;
  listRelation(queryParams.value).then(response => {
    relationList.value = response.rows;
    total.value = response.total;
    loading.value = false
  });
}
function getIdsList() {
  loading.value = true;
  listIds(idsQueryParams.value).then(response => {
    idsList.value = response.rows;
    idsTotal.value = response.total;
    loading.value = false
  });
}
// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    id: null,
    type: null,
    ids: null
  };
  proxy.resetForm("relationRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.id);
  single.value = selection.length != 1;
  multiple.value = !selection.length;
}

/** 新增按钮操作 */
function handleAdd() {
  reset();
  open.value = true;
  title.value = "添加优惠券关联";
  getIdsList()
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getRelation(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改优惠券关联";
  });
}

/** 提交按钮 */
function submitForm() {
  console.log(ids.value)
  const param = {
    ids: ids.value,
    couponId: route.params.id,
    type: route.params.scope
  }
  addByIds(param).then(() => {
    getList()
    getIdsList();
    proxy.$modal.msgSuccess("添加成功");
  }).catch(() => {});
}

/** 添加ids按钮操作 */
function addIds(row) {
  const _ids = row.id || ids.value;
  form.value.ids = _ids
  form.value.couponId = route.params.id
  form.value.type = route.params.scope
  addRelation(form.value).then(() => {
    getList()
    getIdsList();
    proxy.$modal.msgSuccess("添加成功");
  }).catch(() => {});
}
function handleDelete(row) {
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除优惠券编号为"' + _ids + '"的数据项？').then(function() {
    return delRelation(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}
/** 导出按钮操作 */
function handleExport() {
  proxy.download('shop/relation/export', {
    ...queryParams.value
  }, `relation_${new Date().getTime()}.xlsx`)
}

getList();
</script>
<style>
.pagination-container .el-pagination{
  right: 50px;
}
</style>