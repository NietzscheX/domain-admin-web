<template>
  <div class="flex flex-1 items-center">
    <template v-if="value && value.id">
      <el-tag
        closable
        @close="handleClose"
        @click="handleEditHost"
        >{{ value.user }}@{{ value.host }}</el-tag
      >
    </template>

    <template v-else>
      <el-autocomplete
        v-model="keyword"
        style="width: 180px"
        :fetch-suggestions="handleSearch"
        clearable
        placeholder="搜索主机"
        @select="handleSelect"
      />

      <el-link
        class="ml-sm"
        :underline="false"
        type="primary"
        @click="handleAddClick"
        ><el-icon><Plus /></el-icon><span>{{ $t('添加') }}</span>
      </el-link>
    </template>

    <!-- 一键部署 -->

    <el-button
      class="ml-md ml-auto"
      :disabled="disabled"
      @click="handleDeployVerifyFile"
      >一键部署</el-button
    >

    <DataFormDialog
      v-model:visible="visible"
      :row="editValue"
    ></DataFormDialog>
  </div>
</template>

<script>
// created at 2023-07-29
import DataFormDialog from './DataFormDialog.vue'

export default {
  name: 'RemoteHost',

  props: {
    defaultKeyword: {
      type: String,
      default: '',
    },
    modelValue: {
      type: Object,
      default: null,
    },
  },

  emits: ['on-confirm', 'update:modelValue'],

  components: {
    DataFormDialog,
  },

  data() {
    return {
      visible: false,

      keyword: '',
      list: [],
      editValue: null,

      // row: {
      //   id: null,
      //   host: '',
      //   password: '',
      //   user: '',
      // },
    }
  },

  computed: {
    disabled() {
      return !(this.modelValue && this.modelValue.id)
    },

    value: {
      get() {
        return this.modelValue
      },
      set(val) {
        this.$emit('update:modelValue', val)
      },
    },
  },

  methods: {
    async getData() {
      if (this.defaultKeyword) {
        this.keyword = this.defaultKeyword
      }
    },

    handleClose() {
      this.value = null
    },

    handleAddClick() {
      this.editValue = {
        host: this.keyword,
      }
      this.visible = true
    },

    handleEditHost() {
      this.editValue = this.value
      this.visible = true
    },

    async handleSearch(queryString, cb) {
      let params = {
        // 域名列表
        keyword: queryString,
      }

      const res = await this.$http.getHostList(params)

      if (res.code == 0) {
        cb(
          res.data.list.map((item) => {
            item.value = item.host
            return item
          })
        )
      } else {
        this.$msg.error(res.msg)
      }
    },

    handleSelect(data) {
      console.log(data)
      this.value = data
    },

    handleDeployVerifyFile() {
      this.$emit('on-confirm', this.value)
    },
  },

  created() {
    this.getData()
  },
}
</script>

<style lang="less"></style>

<style lang="less" scoped></style>
