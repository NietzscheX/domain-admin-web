<template>
  <div>
    <el-table
      :data="list"
      stripe
      border
      @selection-change="$emit('selection-change', $event)"
    >
      <el-table-column
        type="selection"
        header-align="center"
        align="center"
        width="40"
      />

      <!-- 域名列表 -->
      <el-table-column
        label="域名"
        header-align="center"
        align="center"
        prop="domains"
      >
        <template #default="scope">
          <template v-for="domain in scope.row.domains">
            <div>{{ domain }}</div>
          </template>
        </template>
      </el-table-column>

      <!-- SSL签发时间 -->
      <el-table-column
        label="SSL签发时间"
        header-align="center"
        align="center"
        prop="start_time"
        width="170"
      >
        <template #default="scope">
          <span>{{ scope.row.start_time || '-' }}</span>
        </template>
      </el-table-column>

      <!-- SSL过期时间 -->
      <el-table-column
        label="SSL过期时间"
        header-align="center"
        align="center"
        prop="expire_time"
        width="170"
      >
        <template #default="scope">
          <span>{{ scope.row.expire_time || '-' }}</span>
        </template>
      </el-table-column>

      <!-- 证书天数 -->
      <el-table-column
        label="证书天数"
        header-align="center"
        align="center"
        width="110"
        sortable="custom"
        prop="expire_days"
      >
        <template #default="scope">
          <ExpireProgress
            :startTime="scope.row.start_time"
            :endTime="scope.row.expire_time"
          ></ExpireProgress>
        </template>
      </el-table-column>

      <!-- 验证状态 -->
      <el-table-column
        label="状态"
        header-align="center"
        align="center"
        prop="status"
        width="90"
      >
        <template #default="scope">
          <ConnectStatus
            :value="scope.row.show_status"
            @on-click="handleEditRow(scope.row)"
          ></ConnectStatus>

          <el-link
            :underline="false"
            type="primary"
            @click="handleEditRow(scope.row)"
          >
            <span style="margin-left: 4px">{{
              scope.row.status_label || '-'
            }}</span></el-link
          >
        </template>
      </el-table-column>

      <!-- 创建时间 -->
      <el-table-column
        label="更新时间"
        header-align="center"
        align="center"
        width="170"
        prop="update_time_label"
      >
        <template #default="scope">
          <span>{{ scope.row.update_time_label || '-' }}</span>
        </template>
      </el-table-column>

      <!-- 操作 -->
      <!-- <el-table-column
        label="状态"
        header-align="center"
        align="center"
        width="80"
      >
        <template #default="scope">
          <el-switch
            v-model="scope.row.status"
            @change="handleStatusChange(scope.row, $event)"
          />
        </template>
      </el-table-column> -->

      <!-- 自动续期 -->
      <el-table-column
        label="自动续期"
        width="100"
        header-align="center"
        align="center"
      >
        <template #header>
          <el-tooltip
            effect="dark"
            content="自动验证和自动部署成功的证书才会自动续期"
            placement="top-start"
            :show-after="800"
          >
            <div class="inline-flex items-center">
              <span class="mr-[2px]">自动续期</span>
              <el-icon><Warning /></el-icon>
            </div>
          </el-tooltip>
        </template>

        <template #default="scope">
          {{ scope.row.is_auto_renew ? '是' : '否' }}
        </template>
      </el-table-column>

      <el-table-column
        label="查看"
        width="60"
        header-align="center"
        align="center"
      >
        <template #default="scope">
          <el-link
            :underline="false"
            type="primary"
            :disabled="!scope.row.has_ssl_certificate"
            @click="handleOpenDetail(scope.row)"
            ><el-icon><Tickets /></el-icon
          ></el-link>
        </template>
      </el-table-column>

      <!-- 续期 -->
      <el-table-column
        label="续期"
        width="60"
        align="center"
        prop="tag"
      >
        <template #default="scope">
          <el-popconfirm
            title="确定续期？"
            @confirm="handleRenewIssueCertificateById(scope.row)"
          >
            <template #reference>
              <el-link
                :underline="false"
                type="primary"
                :disabled="!scope.row.is_auto_renew"
                ><el-icon><Refresh /></el-icon
              ></el-link>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>

      <!-- 删除 -->
      <el-table-column
        label="删除"
        width="60"
        align="center"
        prop="tag"
      >
        <template #default="scope">
          <el-popconfirm
            title="确定删除？"
            @confirm="handleDeleteClick(scope.row)"
          >
            <template #reference>
              <el-link
                :underline="false"
                type="danger"
                ><el-icon><Delete /></el-icon
              ></el-link>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- 编辑框 -->
    <DataFormDialog
      v-model:visible="dialogVisible"
      :row="currentRow"
      :defaultActiveStep="1"
      @on-success="handleUpdateSuccess"
      @on-close="$emit('on-close')"
    ></DataFormDialog>

    <!-- 详情 -->
    <CertificateDetailDialog
      v-model:visible="CertificateDetailDialogVisible"
      :row="currentRow"
    ></CertificateDetailDialog>
  </div>
</template>

<script>
/**
 * created 2023-07-23
 */
import DataFormDialog from '../issue-certificate-edit/DataFormDialog.vue'
import ConnectStatus from '@/components/ConnectStatus.vue'
import ExpireProgress from '@/components/ExpireProgress.vue'
import CertificateDetailDialog from '../issue-certificate-detail/DataFormDialog.vue'

export default {
  name: '',

  components: {
    DataFormDialog,
    ConnectStatus,
    ExpireProgress,
    CertificateDetailDialog,
  },

  props: {
    list: {
      type: Array,
    },
  },

  emits: ['on-close', 'on-success', 'selection-change'],

  computed: {},

  data() {
    return {
      currentRow: null,
      dialogVisible: false,
      CertificateDetailDialogVisible: false,
    }
  },

  methods: {
    handleEditRow(row) {
      this.currentRow = row
      this.dialogVisible = true
    },

    handleOpenDetail(row) {
      this.currentRow = row
      this.CertificateDetailDialogVisible = true
    },

    async handleDeleteClick(row) {
      let params = {
        issue_certificate_id: row.id,
      }

      const res = await this.$http.deleteCertificateById(params)

      if (res.code == 0) {
        this.$msg.success('操作成功')
        this.$emit('on-success')
      } else {
        this.$msg.error(res.msg)
      }
    },

    async handleStatusChange(row) {
      let params = {
        id: row.id,
      }

      const res = await this.$http.function(params)

      if (res.code == 0) {
        this.$msg.success('操作成功')
        this.$emit('on-success')
      } else {
        this.$msg.error(res.msg)
      }
    },

    async handleRenewIssueCertificateById(row) {
      let loading = this.$loading({ fullscreen: true })

      let params = {
        issue_certificate_id: row.id,
      }

      const res = await this.$http.renewIssueCertificateById(params)

      if (res.code == 0) {
        this.$msg.success('操作成功')
        this.$emit('on-success')
      } else {
        this.$msg.error(res.msg)
      }

      this.$nextTick(() => {
        // 以服务的方式调用的 Loading 需要异步关闭
        loading.close()
      })
    },

    handleUpdateSuccess() {
      this.$emit('on-success')
    },
  },

  created() {},
}
</script>

<style lang="less"></style>

<style lang="less" scoped></style>
