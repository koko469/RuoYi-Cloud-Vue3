<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="商品名称" prop="name">
        <el-input
            v-model="queryParams.name"
            placeholder="请输入商品名称"
            clearable
            @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="商品编号" prop="goodsNo">
        <el-input
          v-model="queryParams.goodsNo"
          placeholder="请输入商品编号"
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
          v-hasPermi="['shop:goods:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['shop:goods:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['shop:goods:remove']"
        >删除</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['shop:goods:export']"
        >导出</el-button>
      </el-col>
      <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="goodsList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
<!--      <el-table-column label="Id" width="160" align="center" prop="id" />-->
      <el-table-column label="商品编号" align="center" prop="goodsNo" />

      <el-table-column label="商品名称" align="center" prop="name" width="300"/>
<!--      <el-table-column label="商品摘要" align="center" prop="remark" />-->
<!--      <el-table-column label="商品主图" align="center" prop="image" width="100">-->
<!--        <template #default="scope">-->
<!--          <image-preview :src="scope.row.image" :width="50" :height="50"/>-->
<!--        </template>-->
<!--      </el-table-column>-->
      <el-table-column label="商品类型" align="center" prop="type" >
        <template v-slot="scope">
          {{scope.row.type==0?"普通商品":"其他商品" }}
        </template>
      </el-table-column>
      <el-table-column label="类别" align="center" prop="labelName" />
      <el-table-column label="是否推荐" align="center" prop="recommendFlag" >
        <template v-slot="scope">
          {{scope.row.recommendFlag==0?"否":"是" }}
        </template>
      </el-table-column>
      <el-table-column label="是否最新" align="center" prop="newFlag" >
        <template v-slot="scope">
          {{scope.row.newFlag==0?"否":"是" }}
        </template>
      </el-table-column>
      <el-table-column label="是否热" align="center" prop="hotFlag" >
        <template v-slot="scope">
          {{scope.row.hotFlag==0?"否":"是" }}
        </template>
      </el-table-column>
      <el-table-column label="是否促销" align="center" prop="promotionFlag" >
        <template v-slot="scope">
          {{scope.row.promotionFlag==0?"否":"是" }}
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center" prop="state" >
        <template v-slot="scope">
          {{scope.row.state==0?"否":"是" }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center"  width="200" >
        <template #default="scope">
          <el-button size="small" plain type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['shop:goods:edit']">修改</el-button>
          <el-button size="small" plain type="danger" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['shop:goods:remove']">删除</el-button>
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

    <!-- 添加或修改商品对话框 -->
    <el-dialog :title="title" v-model="open" width="70%" append-to-body>
      <el-form ref="goodsRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="商品编号" prop="goodsNo">
          <el-input v-model="form.goodsNo" placeholder="不填自动生成"   />
        </el-form-item>
          <el-form-item label="商品类别" prop="type">
            <el-cascader
                v-model="form.type"
                :options="type"
                :props="customProps"
                @change="handleChange"
            />
          </el-form-item>
          <el-form-item label="商品分类" prop="labelId">
            <el-cascader
                v-model="form.labelId"
                :options="label"
                :props="customProps"
                @change="handleChange"
            />
          </el-form-item>
          <el-form-item label="运费模板" prop="freightId">
            <el-cascader
                v-model="form.freightId"
                :options="freight"
                :props="customProps"
                @change="handleChange"
            />
          </el-form-item>

        <el-form-item label="商品摘要" prop="remark">
          <el-input v-model="form.remark" placeholder="请输入商品摘要" />
        </el-form-item>
        <el-form-item label="内容">
          <editor v-model="form.content" :min-height="192"/>
        </el-form-item>
        <el-form-item label="配送说明" prop="deliveryInstructions">
          <el-input v-model="form.deliveryInstructions" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="商品主图" prop="image">
          <image-upload :limit="1" :maxSize="{ width: 200, height: 200 }":isShowTip="false" v-model="form.image"/>
        </el-form-item>
        <el-row :gutter="20">
          <el-form-item label="是否推荐" prop="recommendFlag">
            <el-switch v-model="form.recommendFlag" active-value="1"
                       inactive-value="0" />
          </el-form-item>
          <el-form-item label="是否最新" prop="newFlag">
            <el-switch v-model="form.newFlag" active-value="1"
                       inactive-value="0" />
          </el-form-item>
          <el-form-item label="是否热门" prop="hotFlag">
            <el-switch v-model="form.hotFlag" active-value="1"
                       inactive-value="0"/>
          </el-form-item>
          <el-form-item label="是否促销" prop="promotionFlag">
            <el-switch v-model="form.promotionFlag" active-value="1"
                       inactive-value="0" />
          </el-form-item>
          <el-form-item label="是否上架" prop="state" >
            <el-switch v-model="form.state"
                       active-value="1"
                       inactive-value="0"/>
          </el-form-item>
        </el-row>
        <el-table :data="tableData" class="specTable table-layout" max-height="250"  @row-drop="handleRowDrop">
<!--          <el-table-column prop="id" label="ID" width="auto" />-->
          <el-table-column prop="name" label="规格" width="150">
            <template #default="scope">
              <el-input
                  v-model="scope.row.name"
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="id" label="属性" width="auto">
            <template #default="scope">
              <div class="flex gap-2 flex-wrap">
                <span v-for="tag in scope.row.attr" :key="tag.id" class="tag-wrapper">
                  <el-tag
                      closable
                      :disable-transitions="false"
                      @close="handleClose(tag.id, scope.$index)"
                  >
                    {{ tag.name }}
                  </el-tag>
                </span>
                  <el-input
                      v-if="inputVisible[scope.$index]"
                      ref="InputRef"
                      v-model="inputValue[scope.$index]"
                      class="w-20"
                      size="small"
                      @keyup.enter="handleInputConfirm(scope.$index)"
                      @blur="handleInputConfirm(scope.$index)"
                  />
                  <el-button
                      v-else
                      class="button-new-tag"
                      size="small"
                      @click="showInput(scope.$index)"
                  >
                    新增属性
                  </el-button>
              </div>
            </template>
          </el-table-column>
          <el-table-column fixed="right" label="操作" width="100">
            <template #default="scope">
              <el-button
                  link
                  type="primary"
                  size="small"
                  @click.prevent="deleteRow(scope.$index)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-button class="mt-4" plain style="width: 100%" @click="onAddItem">
          新增规格
        </el-button>
      </el-form>
      <div>
        <el-table :data="attributeCombinations" class="table-layout" max-height="500" >
          <!--          <el-table-column prop="id" label="ID" width="auto" />-->
<!--          <el-table-column prop="ids" label="ids"  width="150" />-->
          <el-table-column prop="attributeNames" label="属性组合" width="150" />
          <el-table-column prop="price" label="价格" width="100">
            <template #default="scope">
              <el-input
                  v-model="scope.row.price"
                  type = "number"
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="originalPrice" label="原价" width="100">
            <template #default="scope">
              <el-input
                  v-model="scope.row.originalPrice" type = "number"
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="costPrice" label="成本价" width="100">
            <template #default="scope">
              <el-input
                  v-model="scope.row.costPrice" type = "number"
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="activityPrice" label="活动价" width="100">
            <template #default="scope">
              <el-input
                  v-model="scope.row.activityPrice" type = "number"
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="integral" label="积分" width="100">
            <template #default="scope">
              <el-input
                  v-model="scope.row.integral" type = "number"
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="weight" label="重量" width="100">
            <template #default="scope">
              <el-input
                  v-model="scope.row.weight" type = "number"
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="stock" label="库存" width="100">
            <template #default="scope">
              <el-input
                  v-model="scope.row.stock" type = "number"
              ></el-input>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="图片" width="150">
            <template #default="scope" >
              <image-upload  :maxSize="{ width: 100, height: 100 }"  :limit="1" :isShowTip="false" v-model="scope.row.imageUrl"/>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="是否启用" width="150">
            <template #default="scope">
            <el-switch v-model="scope.row.state"
                       active-value="0"
                       inactive-value="1"/>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Goods">
import { listGoods, getGoods, delGoods, addGoods, updateGoods } from "@/api/shop/goods";
import { listFreight } from "@/api/shop/freight";
import { listLabelByAddGoods } from "@/api/shop/label";
const { proxy } = getCurrentInstance();
import { onMounted, nextTick } from 'vue';
import Sortable from 'sortablejs'

const goodsList = ref([]);
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
    goodsNo: null,
    type: null,
    name: null,
    content: null,
    deliveryInstructions: null,
    image: null,
    recommendFlag: null,
    newFlag: null,
    hotFlag: null,
    promotionFlag: null,
    state: null,
  },
  rules: {
    labelId: [
      { required: true, message: "分类id不能为空", trigger: "blur" }
    ],
    freightId: [
      { required: true, message: "运费id不能为空", trigger: "blur" }
    ],
    goodsNo: [
      { required: false, message: "商品编号不能为空", trigger: "blur" }
    ],
    type: [
      { required: true, message: "商品类型：0普通商品不能为空", trigger: "change" }
    ],
    name: [
      { required: true, message: "商品名称不能为空", trigger: "blur" }
    ],
    recommendFlag: [
      { required: true, message: "是否推荐 0否1是不能为空", trigger: "blur" }
    ],
    newFlag: [
      { required: true, message: "是否最新 0否1是不能为空", trigger: "blur" }
    ],
    hotFlag: [
      { required: true, message: "是否热门 0否1是不能为空", trigger: "blur" }
    ],
    promotionFlag: [
      { required: true, message: "是否促销 0否1是不能为空", trigger: "blur" }
    ],
    delFlag: [
      { required: true, message: "删除已否 0正常 1删除不能为空", trigger: "blur" }
    ],
    state: [
      { required: true, message: "0上架 1下架不能为空", trigger: "blur" }
    ],
    createTime: [
      { required: true, message: "创建时间不能为空", trigger: "blur" }
    ],
    updateTime: [
      { required: true, message: "更新时间不能为空", trigger: "blur" }
    ]
  }
});

const customProps = ref({
      emitPath: false, // 只返回该节点的值
      value: "id", // 自定义当前数组的键名 - value
      label: "name", // 自定义当前数组的键名 - label
      children: "hildren", // 自定义当前数组的键名 - children
      expandTrigger: "hover", // 次级菜单的展开方式 - click/hover
})
const tableData = ref([
])

const inputVisible = ref(tableData.value.map(() => false))
const inputValue = ref(tableData.value.map(() => ''))
const InputRef = ref()
const attributeCombinations = ref([])
const label = ref([])
const freight = ref([])
const type = [
  {
    id: '0',
    name: '普通商品'
  },
  {
    id: '1',
    name: '其他商品'
  }
]
const { queryParams, form, rules } = toRefs(data);
/** 查询商品列表 */
function getList() {
  loading.value = true;
  listGoods(queryParams.value).then(response => {
    goodsList.value = response.rows;
    total.value = response.total;
    loading.value = false;
  });
}
const generateCombinations = () => {
  if (tableData.value.length === 0){
    attributeCombinations.value = []
    return
  }
  const combinations = [];
  // 定义默认值
  const DEFAULT_PRICE = 1.00;
  const DEFAULT_ORIGINAL_PRICE = 1.00;
  const DEFAULT_COST_PRICE = 1.00;
  const DEFAULT_ACTIVITY_PRICE = 1.00;
  const DEFAULT_INTEGRAL = 1;
  const DEFAULT_WEIGHT = 1;
  const DEFAULT_STOCK = 1;
  const DEFAULT_STATE = "0";

  // 提取属性数组
  const attrArrays = tableData.value.map(item => item.attr.map(attr => ({ id: attr.id, name: attr.name })));

  // 计算笛卡尔积
  const cartesianProduct = (arr) => {
    return arr.reduce((a, b) => a.flatMap(x => b.map(y => [...x, y])), [[]]);
  };

  // 生成所有可能的属性组合
  const result = cartesianProduct(attrArrays);

  // 处理每个组合
  result.forEach(combination => {
    // 按名称排序
    combination.sort((a, b) => a.name.localeCompare(b.name));

    // 提取属性ID和名称
    const ids = combination.map(item => item.id).join(',');
    const attributeNames = combination.map(item => item.name).join(',');

    // 检查attributeCombinations.value中是否存在相同的attributeNames
    const existingCombination = attributeCombinations.value.find(item => item.attributeNames === attributeNames);

    if (existingCombination) {
      // 如果存在，直接使用该对象的值
      combinations.push(existingCombination);
    } else {
      // 如果不存在，生成新的组合
      const newCombination = {
        ids,
        attributeNames,
        price: DEFAULT_PRICE,
        originalPrice: DEFAULT_ORIGINAL_PRICE,
        costPrice: DEFAULT_COST_PRICE,
        activityPrice: DEFAULT_ACTIVITY_PRICE,
        integral: DEFAULT_INTEGRAL,
        weight: DEFAULT_WEIGHT,
        stock: DEFAULT_STOCK,
        state: DEFAULT_STATE,
      };
      combinations.push(newCombination);
    }
  });

  // 更新属性组合
  attributeCombinations.value = combinations;
};

watch(tableData, generateCombinations, { deep: true })
const handleClose = (id, row) => {
  const index = tableData.value[row].attr.findIndex(attr => attr.id === id)
  if (index !== -1) {
    tableData.value[row].attr.splice(index, 1)
  }
}
const showInput = (index) => {
  inputVisible.value[index] = true
}

//新增属性
const handleInputConfirm = (index) => {
  if (inputValue.value[index]) {
    tableData.value[index].attr.push({
      id: null,
      name: inputValue.value[index]
    })
  }
  inputVisible.value[index] = false
  inputValue.value[index] = ''
}
// 取消按钮
function cancel() {
  open.value = false;
  reset();
}

// 表单重置
function reset() {
  form.value = {
    goodsNo: null,
    type: null,
    name: null,
    content: " ",
    deliveryInstructions: null,
    image: null,
    recommendFlag: 0,
    newFlag: 0,
    hotFlag: 0,
    promotionFlag: 0,
    state: 1,
  };
  tableData.value = [];
  attributeCombinations.value=[];
  console.log(form.value)
  proxy.resetForm("goodsRef");
}

//移动行交换
const handleRowDrop = (event) => {
  const { oldIndex, newIndex } = event;
  const [movedRow] = tableData.value.splice(oldIndex, 1);
  tableData.value.splice(newIndex, 0, movedRow);

  // 深拷贝数据并重新赋值
  const newTableData = tableData.value.slice();
  tableData.value = [];
  nextTick(() => {
    tableData.value = newTableData;
    console.log(tableData.value)
  });

};
//删除规格
const deleteRow = (index) => {
  tableData.value.splice(index, 1)
}
// 新增规格
const onAddItem = () => {
  tableData.value.push({
    name: '',
    id: '',
    attr: []
  })
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
  title.value = "添加商品";
  listFreight().then(response => {
    freight.value = response.rows
  });
  listLabelByAddGoods().then(res => {
    label.value = res.data;
  })
}
/** 修改按钮操作 */
function handleUpdate(row) {
  reset();
  const _id = row.id || ids.value
  let labelId = null;
  let freightId = null;
  getGoods(_id).then(response => {
    form.value = response.data.goods;
    labelId = response.data.goods.labelId;
    freightId = response.data.goods.freightId;
    tableData.value = response.data.goodsSpecs;
    attributeCombinations.value = response.data.goodsSpecAttributePrice;
    open.value = true;
    title.value = "修改商品";
    console.log(attributeCombinations.value)
  });
  listFreight().then(response => {
    freight.value = response.rows
  });
  listLabelByAddGoods().then(res => {
    label.value = res.data;
  })
  setTimeout(() => {
    const specTable = document.querySelector('.specTable .el-table__body-wrapper tbody');
    console.log(specTable);
    if (specTable) {
      Sortable.create(specTable, {
        animation: 150,
        onEnd: handleRowDrop,
      });
    } else {
      console.error('Element with class "specTable table-layout" not found');
    }
  }, 1000);
}

/** 提交按钮 */
function submitForm() {
  proxy.$refs["goodsRef"].validate(valid => {
    if (valid) {
      if (form.value.id != null) {
        const map = {
          goods: form.value,
          goodsSpecs: tableData.value,
          goodsSpecAttributePrice: attributeCombinations.value,
        }
        console.log(map)
        updateGoods(map).then(response => {
          proxy.$modal.msgSuccess("修改成功");

          open.value = false;
          getList();
        });
      } else {
        const map = {
          goods: form.value,
          goodsSpecs: tableData.value,
          goodsSpecAttributePrice: attributeCombinations.value,
        }
        addGoods(map).then(response => {
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
  proxy.$modal.confirm('是否确认删除商品编号为"' + _ids + '"的数据项？').then(function() {
    return delGoods(_ids);
  }).then(() => {
    getList();
    proxy.$modal.msgSuccess("删除成功");
  }).catch(() => {});
}

/** 导出按钮操作 */
function handleExport() {
  proxy.download('shop/goods/export', {
    ...queryParams.value
  }, `goods_${new Date().getTime()}.xlsx`)
}

getList();
</script>
<style>
.flex {
  display: flex;
}

.flex-wrap {
  flex-wrap: wrap;
}

.gap-2 {
  gap: 0.5rem;
}
.w-20 {
  width: 5rem; /* 20 * 0.25rem */
}
.table-layout {
  table-layout: auto;
  width: 100%;
}
</style>