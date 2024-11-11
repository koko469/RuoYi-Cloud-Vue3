<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="模板名称" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入模板名称"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="首个单位 首件数/首重量" prop="firstUnit">
        <el-input
          v-model="queryParams.firstUnit"
          placeholder="请输入首个单位 首件数/首重量"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="首个单位金额" prop="firstMoney">
        <el-input
          v-model="queryParams.firstMoney"
          placeholder="请输入首个单位金额"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="需单位  续件数/续重量" prop="continuityUnit">
        <el-input
          v-model="queryParams.continuityUnit"
          placeholder="请输入需单位  续件数/续重量"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="续单位金额" prop="continuityMoney">
        <el-input
          v-model="queryParams.continuityMoney"
          placeholder="请输入续单位金额"
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
          v-hasPermi="['shop:freight:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['shop:freight:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['shop:freight:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['shop:freight:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="freightList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="运费模板id" align="center" prop="id" />
      <el-table-column label="模板名称" align="center" prop="name" />
      <el-table-column label="类型 0包邮 1按件数 2按重量 " align="center" prop="type" />
      <el-table-column label="首个单位 首件数/首重量" align="center" prop="firstUnit" />
      <el-table-column label="首个单位金额" align="center" prop="firstMoney" />
      <el-table-column label="需单位  续件数/续重量" align="center" prop="continuityUnit" />
      <el-table-column label="续单位金额" align="center" prop="continuityMoney" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['shop:freight:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['shop:freight:remove']">删除</el-button>
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

    <!-- 添加或修改运费模板对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="freightRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="模板名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入模板名称" />
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

<script setup name="Freight">
import { listFreight, getFreight, delFreight, addFreight, updateFreight } from "@/api/shop/freight";

const { proxy } = getCurrentInstance();

const freightList = ref([]);
const open = ref(false);
const loading = ref(true);
const showSearch = ref(true);
const ids = ref([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);
const title = ref("");

const data = reactive({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: null,
    type: null,
    firstUnit: null,
    firstMoney: null,
    continuityUnit: null,
    continuityMoney: null,
  },
  rules: {
    name: [
      { required: true, message: "模板名称不能为空", trigger: "blur" }
    ],
    type: [
      { required: true, message: "类型 0包邮 1按件数 2按重量 不能为空", trigger: "change" }
    ],
    firstUnit: [
      { required: true, message: "首个单位 首件数/首重量不能为空", trigger: "blur" }
    ],
    firstMoney: [
      { required: true, message: "首个单位金额不能为空", trigger: "blur" }
    ],
    continuityUnit: [
      { required: true, message: "需单位  续件数/续重量不能为空", trigger: "blur" }
    ],
    continuityMoney: [
      { required: true, message: "续单位金额不能为空", trigger: "blur" }
    ],
  }
});

const { queryParams, form, rules } = toRefs(data);

/** 查询运费模板列表 */
function getList() {
  loading.value = true;
  listFreight(queryParams.value).then(response => {
    freightList.value = response.rows;
    total.value = response.total;
    loading.value = false;
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
    type: null,
    firstUnit: null,
    firstMoney: null,
    continuityUnit: null,
    continuityMoney: null,
    createTime: null,
    delFlag: null
  };
  proxy.resetForm("freightRef");
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
  title.value = "添加运费模板";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getFreight(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改运费模板";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["freightRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateFreight(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addFreight(form.value).then(response => {
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
  const _ids = row.id || ids.value;
  proxy.$modal.confirm('是否确认删除运费模板编号为"' + _ids + '"的数据项？').then(function() {
    return delFreight(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('shop/freight/export', {
    ...queryParams.value
  }, `freight_${new Date().getTime()}.xlsx`)
}

getList();
</script>
