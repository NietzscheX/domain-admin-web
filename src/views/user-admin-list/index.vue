<template>
  <div class="app-container">
    <!-- 操作按钮 -->
    <div class="flex justify-between margin-bottom--20">
      <el-button
        type="primary"
        @click="handleAddRow"
        ><el-icon><Plus /></el-icon>{{ $t('添加') }}</el-button
      >

      <el-input
        class="ml-sm"
        style="width: 260px"
        v-model="keyword"
        placeholder="搜索用户名"
        clearable
        @keypress.enter="handleSearch"
        @clear="handleSearch"
      >
        <template #append>
          <el-button @click="handleSearch">
            <el-icon><Search /></el-icon
          ></el-button>
        </template>
      </el-input>
    </div>

    <!-- 数据列表 -->
    <DataTable
      class="mt-md"
      v-loading="loading"
      :list="list"
      @on-success="resetData"
    />

    <!-- 翻页 -->
    <el-pagination
      class="mt-md justify-center"
      background
      layout="total, sizes, prev, pager, next"
      :total="total"
      v-model:page-size="size"
      v-model:current-page="page"
      @current-change="getData"
      @size-change="handleSizeChange"
    />

    <!-- 编辑框 -->
    <DataFormDailog
      v-model:visible="dialogVisible"
      @on-success="handleAddSuccess"
    ></DataFormDailog>
  </div>
</template>

<script>
/**
 * created 2022-10-03
 */

import DataFormDailog from '../user-admin-edit/DataFormDailog.vue'
import DataTable from './DataTable.vue'

export default {
  name: 'user-admin-list',

  props: {},

  components: {
    DataFormDailog,
    DataTable,
  },

  data() {
    return {
      list: [],
      total: 0,
      page: 1,
      size: 20,
      keyword: '',

      pageSizeCachekey: 'pageSize',

      loading: true,
      dialogVisible: false,
    }
  },

  computed: {},

  methods: {
    resetData() {
      this.page = 1
      this.getData()
    },

    refreshData() {
      this.getData()
    },

    async getData() {
      this.loading = true

      let params = {
        // ticket: this.ticket,
        page: this.page,
        size: this.size,
        keyword: this.keyword.trim(),
      }

      const res = await this.$http.getUserList(params)

      if (res.code == 0) {
        this.list = res.data.list
        this.total = res.data.total
      } else {
        this.$msg.error(e.msg)
      }

      this.loading = false
    },

    handleAddRow() {
      this.dialogVisible = true
    },

    handleAddSuccess() {
      this.resetData()
    },

    handleSearch() {
      this.resetData()
    },

    handleSizeChange(value) {
      localStorage.setItem(this.pageSizeCachekey, value)
      this.resetData()
    },

    loadPageSize() {
      let size = localStorage.getItem(this.pageSizeCachekey)
      if (size) {
        this.size = parseInt(size)
      }
    },
  },

  created() {
    this.loadPageSize()
    this.getData()
  },
}
</script>

<style lang="less"></style>

<style lang="less" scoped></style>
