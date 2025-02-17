<template>
  <div class="">
    <VerifyStepFileDataTable
      :form="form"
      :list="list"
      challenge-type="http-01"
    ></VerifyStepFileDataTable>

    <el-form
      label-width="130px"
      class="mt-md"
    >
      <el-form-item
        label="服务器地址"
        prop="create_time"
      >
        <RemoteHost
          v-if="hasInit"
          :defaultKeyword="host"
          v-model="deploy_host"
          @on-confirm="handleDeployVerifyFile"
        ></RemoteHost>
      </el-form-item>

      <el-form-item
        label="服务器目录"
        prop="create_time"
      >
        <el-input v-model="verifyDeployPath"></el-input>
      </el-form-item>

      <el-form-item
        label="Nginx配置"
        prop="isp"
      >
        <CodeHighlight :value="nginxConfig"></CodeHighlight>
      </el-form-item>
    </el-form>

    <!-- 操作 -->
    <div class="text-center mt-md">
      <el-button
        type="primary"
        @click="handleVerifyCertificateById"
        >验 证</el-button
      >
    </div>
  </div>
</template>

<script>
// created at 2023-07-23
import FileSaver from 'file-saver'

import VerifyStepFileDataTable from './VerifyStepFileDataTable.vue'
import RemoteHost from '@/components/remote-host/index.vue'
import CodeHighlight from '@/components/code-highlight/index.vue'

export default {
  name: 'VerifyStep',

  props: {
    form: {
      type: Object,
    },
    list: {
      type: Array,
    },
  },

  emits: ['on-success'],

  components: {
    VerifyStepFileDataTable,
    RemoteHost,
    CodeHighlight,
  },

  data() {
    return {
      host: '',
      hasInit: false,
      verifyDeployPath: '',
      deploy_host: null,
    }
  },

  computed: {
    domain_list() {
      return this.form.domains.join(' ')
    },

    // https://github.com/diafygi/acme-tiny
    nginxConfig() {
      return `server {
  listen 80;
  server_name ${this.domain_list};

  location /.well-known/acme-challenge/ {
      alias ${this.verifyDeployPath};
      try_files $uri =404;
  }
}`
    },
  },

  methods: {
    async getData() {
      await this.getDomainHost()

      this.hasInit = true
    },

    async getDomainHost() {
      let params = {
        // 域名列表
        domain: this.form.domains[0],
      }

      const res = await this.$http.getDomainHost(params)

      if (res.code == 0) {
        this.host = res.data.host

        if (this.host) {
          await this.getHost()
        }
      } else {
        this.$msg.error(res.msg)
      }
    },

    async getHost() {
      let params = {
        // 域名列表
        keyword: this.host,
      }

      const res = await this.$http.getHostList(params)

      if (res.data.list && res.data.list.length > 0) {
        this.deploy_host = res.data.list[0]
      }
    },
    async handleVerifyCertificateById() {
      let loading = this.$loading({ fullscreen: true })

      let params = {
        // 域名列表
        issue_certificate_id: this.form.id,
        challenge_type: 'http-01',
      }

      const res = await this.$http.verifyCertificateById(params)

      if (res.code == 0) {
        this.$msg.success('验证成功')
        this.$emit('on-success', res.data)
      } else {
        this.$msg.error(res.msg)
      }

      this.$nextTick(() => {
        // 以服务的方式调用的 Loading 需要异步关闭
        loading.close()
      })
    },

    downloadVerifyFile() {
      // 关于vue下载无后缀名的文件被加上后缀.txt，有后缀名的文件下载正常问题的解决
      // https://blog.csdn.net/yanziit/article/details/127990100
      let blob = new Blob([this.form.validation], {
        type: 'application/octet-stream;charset=utf-8',
      })
      FileSaver.saveAs(blob, this.form.token)
    },

    async handleDeployVerifyFile(hostRow) {
      let loading = this.$loading({ fullscreen: true })

      let params = {
        // 域名列表
        issue_certificate_id: this.form.id,
        host_id: hostRow.id,
        verify_deploy_path: this.verifyDeployPath,
        challenges: this.list,
      }

      const res = await this.$http.deployVerifyFile(params)

      if (res.code == 0) {
        this.$msg.success('部署成功')
        this.$emit('on-success', res.data)
      } else {
        this.$msg.error(res.msg)
      }

      this.$nextTick(() => {
        // 以服务的方式调用的 Loading 需要异步关闭
        loading.close()
      })
    },
  },

  created() {
    this.verifyDeployPath = '/var/www/challenges/'
    this.getData()
  },
}
</script>

<style lang="less"></style>

<style lang="less" scoped>
.verify-step__value {
  font-size: 12px;
  word-break: break-all;
}
</style>
