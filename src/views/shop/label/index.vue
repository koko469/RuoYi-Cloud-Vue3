<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="分类名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入分类名称"
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
          v-hasPermi="['shop:label:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="info"
          plain
          icon="Sort"
          @click="toggleExpandAll"
        >展开/折叠</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table
      v-if="refreshTable"
      v-loading="loading"
      :data="labelList"
      row-key="id"
      :default-expand-all="isExpandAll"
      :tree-props="{children: 'hildren', hasChildren: 'hasChildren'}"
      @selection-change="handleSelectionChange"
      @row-drop="handleRowDrop"
      class="labeTable"
    >
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="分类名称" prop="name" />
<!--      <el-table-column label="级数" align="center" prop="level" />-->
      <el-table-column label="图片地址" align="center" prop="imageUrl" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.imageUrl" :width="50" :height="50"/>
        </template>
      </el-table-column>
      <el-table-column label="分类备注" align="center" prop="remark" />
      <el-table-column label="排序" align="center" prop="sort" />
      <el-table-column label="操作"  align="center" >
        <template #default="scope">
          <el-button size="small"  plain type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['shop:label:edit']">修改</el-button>
          <el-button  size="small" plain type="info" icon="Plus" @click="handleAdd(scope.row)" v-hasPermi="['shop:label:add']">新增</el-button>
          <el-button size="small" plain type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['shop:label:remove']">删除</el-button>
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
    <!-- 添加或修改分类对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="labelRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="上级id" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="labelOptions"
            :props="{ value: 'id', label: 'name', children: 'children' }"
            value-key="id"
            placeholder="请选择上级id"
            check-strictly
          />
        </el-form-item>
        <el-form-item label="图片地址" prop="imageUrl">
          <image-upload v-model="form.imageUrl"/>
        </el-form-item>
        <el-form-item label="分类备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input v-model="form.sort" type="number" placeholder="请输入内容" />
        </el-form-item>
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

<script setup name="Label">
import { listLabel, getLabel, delLabel, addLabel, updateLabel } from "@/api/shop/label";
import Sortable from 'sortablejs'
const { proxy } = getCurrentInstance();
const labelList = ref([]);
const labelOptions = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const title = ref("");
const isExpandAll = ref(true);
const refreshTable = ref(true);
const total = ref(0);
const data = reactive({
  form: {},
  queryParams: {
    name: null,
  },
  rules: {
    name: [
      { required: true, message: "分类名称不能为空", trigger: "blur" }
    ],
    level: [
      { required: true, message: "级数不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);
/** 查询分类列表 */
// function getList() {
//   loading.value = true;
//   listLabel(queryParams.value).then(response => {
//     labelList.value = proxy.handleTree(response.rows, "id", "parentId");
//     loading.value = false;
//   });
// }
function getList() {
  loading.value = true;
  listLabel(queryParams.value).then(response => {
    labelList.value = proxy.handleTree(response.rows, "id", "parentId");
    total.value = response.total;
    loading.value = false;
  });
}
/** 查询分类下拉树结构 */
function getTreeselect() {
  listLabel().then(response => {
    labelOptions.value = [];
    const data = { id: 0, name: '顶级节点', children: [] };
    data.children = proxy.handleTree(response.rows, "id", "parentId");
    labelOptions.value.push(data);
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
    name: null,
    parentId: null,
    level: null,
    imageUrl: null,
    remark: null,
    sort: null,
    ids: null,
    idsUrl: null,
    idsType: null,
    delFlag: null,
    hildren: []
  };
  proxy.resetForm("labelRef");
}

/** 搜索按钮操作 */
function handleQuery() {
  getList();
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryRef");
  handleQuery();
}

/** 新增按钮操作 */
function handleAdd(row) {
  reset();
  getTreeselect();
  console.log(row)
  if (row != null && row.id) {
    form.value.parentId = row.id;
  } else {
    form.value.parentId = 0;
  }
  open.value = true;
  title.value = "添加分类";
}

/** 展开/折叠操作 */
function toggleExpandAll() {
  refreshTable.value = false;
  isExpandAll.value = !isExpandAll.value;
  nextTick(() => {
    refreshTable.value = true;
  });
}

/** 修改按钮操作 */
async function handleUpdate(row) {
  reset();
  await getTreeselect();
  if (row != null) {
    form.value.parentId = row.id;
  }
  getLabel(row.id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改分类";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["labelRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateLabel(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addLabel(form.value).then(response => {
          proxy.$modal.msgSuccess("新增成功");
          open.value = false;
          getList();
        });
      }
    }
  });
}

/** 删除按钮操作 */
function handleDelete(row) {
  proxy.$modal.confirm('是否确认删除分类编号为"' + row.id + '"的数据项？').then(function() {
    return delLabel(row.id);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

getList();
</script>
<style>
.labeTable{
  user-select: none;
}
</style>