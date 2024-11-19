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
      <el-form-item label="状态" prop="state">
        <el-input
          v-model="queryParams.state"
          placeholder="请输入状态"
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
          v-hasPermi="['system:coupon:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['system:coupon:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['system:coupon:remove']"
        >删除</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="couponList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
<!--      <el-table-column label="id" align="center" prop="id" />-->
      <el-table-column label="名字" align="center" prop="name" />
      <el-table-column label="类型" align="center" prop="type" >
        <template v-slot="scope">
          {{scope.row.type==0?"满减券":scope.row.type==1?"直减券":scope.row.type==2?"折扣券":scope.row.type==3?"限额折扣券":"其他" }}
        </template>
      </el-table-column>
      <el-table-column label="范围" align="center" prop="scope">
        <template v-slot="scope">
          {{scope.row.scope==0?"全部商品":scope.row.scope==1?"部分商品":scope.row.scope==2?"商品类型":scope.row.scope==3?"商家":"其他" }}
        </template>
      </el-table-column>
      <el-table-column label="额度/折扣" align="center" prop="name" >
        <template v-slot="scope">
          {{scope.row.type==0 || scope.row.type==1?scope.row.discount+"元":scope.row.discount+"折" }}
        </template>
      </el-table-column>
      <el-table-column label="发行量" align="center" prop="num" />
      <el-table-column label="图片" align="center" prop="image" width="100">
        <template #default="scope">
          <image-preview :src="scope.row.image" :width="50" :height="50"/>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="state" >
        <template v-slot="scope">
          {{scope.row.state==0?"未发行":scope.row.state==1?"发行中":scope.row.state==2?"已抢光":scope.row.state==3?"已过期":"已暂停" }}
        </template>
      </el-table-column>
      <el-table-column label="开始发放时间" align="center" prop="startTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.startTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="过期时间" align="center" prop="endTime" width="180">
        <template #default="scope">
          <span>{{ parseTime(scope.row.endTime, '{y}-{m}-{d} {h}:{i}:{s}') }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="180">
        <template #default="scope">
          <el-button v-if="scope.row.state==0" link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:coupon:edit']">修改</el-button>
          <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:coupon:remove']">删除</el-button>
          <el-button link type="primary" icon="Delete" @click="detail(scope.row)" >详情</el-button>
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

    <!-- 添加或修改优惠券对话框 -->
    <el-dialog :title="title" v-model="open" width="50%" append-to-body>
      <el-form ref="couponRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="名字" prop="name">
          <el-input v-model="form.name" placeholder="请输入名字" />
        </el-form-item>
        <el-form-item label="类型" prop="name">
          <el-select v-model="form.type" placeholder="选择类型" style="width: 240px">
            <el-option
                v-for="item in type"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="范围" prop="scope">
          <el-select v-model="form.scope" placeholder="选择范围" style="width: 240px">
            <el-option
                v-for="item in scope"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.type==0 || form.type==1" label="额度" prop="discount">
          <el-input v-model="form.discount" placeholder="请输入额度" type="number" />
        </el-form-item>
        <el-form-item v-else label="折扣" prop="discount">
          <el-input v-model="form.discount" placeholder="请输入折扣" type="number" />
        </el-form-item>
        <el-form-item v-if="form.type==3" label="最高额度" prop="maxLimit">
          <el-input v-model="form.maxLimit" placeholder="请输入折扣后最高额度" type="number"/>
        </el-form-item>
        <el-form-item v-if="form.type==0" label="门槛" prop="threshold">
          <el-input v-model="form.threshold" placeholder="请输满减入门槛" type="number"/>
        </el-form-item>
        <el-form-item label="发行量" prop="num">
          <el-input v-model="form.num" placeholder="请输入发行量" type="number"/>
        </el-form-item>
        <el-form-item label="图片" prop="image">
          <image-upload v-model="form.image"/>
        </el-form-item>
        <el-form-item label="开始发放时间" prop="startTime">
          <el-date-picker clearable
            v-model="form.startTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择开始发放时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="过期时间" prop="endTime">
          <el-date-picker clearable
            v-model="form.endTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="请选择过期时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item label="介绍" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
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

<script setup name="Coupon">
import { listCoupon, getCoupon, delCoupon, addCoupon, updateCoupon } from "@/api/shop/coupon";
import { useRouter } from 'vue-router';

const router = useRouter();
const { proxy } = getCurrentInstance();

const couponList = ref([]);
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
    scope: null,
    state: null,
  },
  rules: {
    name: [
      { required: true, message: "名字不能为空", trigger: "blur" }
    ],
    type: [
      { required: true, message: "类型", trigger: "change" }
    ],
    scope: [
      { required: true, message: "范围不能为空", trigger: "change" }
    ],
    discount: [
      { required: true, message: "折扣/额度不能为空", trigger: "blur" }
    ],
    maxLimit: [
      { required: true, message: "限额折扣券最高额度不能为空", trigger: "blur" }
    ],
    num: [
      { required: true, message: "发行量不能为空", trigger: "blur" }
    ],
    threshold: [
      { required: true, message: "满减券门槛不能为空", trigger: "blur" }
    ],
    state: [
      { required: true, message: "状态", trigger: "blur" }
    ],
    endTime: [
      { required: true, message: "过期时间不能为空", trigger: "blur" }
    ],
    createTime: [
      { required: true, message: "创建时间不能为空", trigger: "blur" }
    ],
    delFlag: [
      { required: true, message: "删除已否 0正常 1删除不能为空", trigger: "blur" }
    ],
  }
});
const type = [
  {
    value: '0',
    label: '满减券',
  },
  {
    value: '1',
    label: '直减券',
  },
  {
    value: '2',
    label: '折扣券',
  },
  {
    value: '3',
    label: '限额折扣券',
  },
]
const scope = [
  {
    value: '0',
    label: '全部商品',
  },
  {
    value: '1',
    label: '部分商品',
  },
  {
    value: '2',
    label: '商品类型',
  },
  {
    value: '3',
    label: '商家',
  },
]
const { queryParams, form, rules } = toRefs(data);

/** 查询优惠券列表 */
function getList() {
  loading.value = true;
  listCoupon(queryParams.value).then(response => {
    couponList.value = response.rows;
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
    scope: null,
    discount: null,
    num: null,
    image: null,
    threshold: null,
    maxLimit: null,
    state: null,
    startTime: null,
    endTime: null,
    createTime: null,
    delFlag: null,
    remark: null
  };
  proxy.resetForm("couponRef");
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
  title.value = "添加优惠券";
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  getCoupon(_id).then(response => {
    form.value = response.data;
    open.value = true;
    title.value = "修改优惠券";
  });
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["couponRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        updateCoupon(form.value).then(response => {
          proxy.$modal.msgSuccess("修改成功");
          open.value = false;
          getList();
        });
      } else {
        addCoupon(form.value).then(response => {
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
  proxy.$modal.confirm('是否确认删除优惠券编号为"' + _ids + '"的数据项？').then(function() {
    return delCoupon(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}
function detail(row) {
  console.log("row")
  console.log(row.id)
  router.push({ name: 'couponRelation', params: { id: row.id,scope: row.scope}})
}
/** 导出按钮操作 */
function handleExport() {
  proxy.download('system/coupon/export', {
    ...queryParams.value
  }, `coupon_${new Date().getTime()}.xlsx`)
}

getList();
</script>
