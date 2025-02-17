<template>
  <div>
    <el-form
      ref="form"
      :model="deployForm"
      :rules="rules"
      label-width="130px"
    >
      <el-form-item
        label="服务器地址"
        prop="deploy_host"
      >
        <RemoteHost
          v-if="hasInit"
          :defaultKeyword="host"
          v-model="deployForm.deploy_host"
          @on-confirm="handleDeployVerifyFile"
        ></RemoteHost>
      </el-form-item>

      <el-form-item
        label="私钥部署路径"
        prop="keyDeployPath"
      >
        <el-input v-model="deployForm.keyDeployPath"></el-input>
      </el-form-item>

      <el-form-item
        label="公钥部署路径"
        prop="pemDeployPath"
      >
        <el-input v-model="deployForm.pemDeployPath"></el-input>
      </el-form-item>

      <el-form-item
        label="重启命令"
        prop="reloadcmd"
      >
        <el-input v-model="deployForm.reloadcmd"></el-input>
      </el-form-item>
    </el-form>

    <div class="mo-form-detail">
      <el-form label-width="130px">
        <el-form-item
          label="SSL证书"
          prop="domain"
        >
          <el-link
            :underline="false"
            type="primary"
            class="mr-sm"
            @click="downloadSSLFile"
            ><el-icon><Download /></el-icon>点击下载（.zip）</el-link
          >
        </el-form-item>

        <el-form-item
          label="Nginx配置"
          prop="domain"
        >
          <CodeHighlight :value="nginxConfig"></CodeHighlight>
        </el-form-item>
      </el-form>

      <!-- 操作 -->
      <div class="text-center mt-md">
        <el-button
          type="primary"
          @click="handleClose"
          >关 闭</el-button
        >
      </div>
    </div>
  </div>
</template>

<script>
// created at 2023-07-23
import FileSaver from 'file-saver'
import JSZip from 'jszip'

import RemoteHost from '@/components/remote-host/index.vue'
import CodeHighlight from '@/components/code-highlight/index.vue'

export default {
  name: 'VerifyStep',

  props: {
    form: {
      type: Object,
    },
  },

  emits: ['on-success', 'on-close'],

  components: {
    RemoteHost,
    CodeHighlight,
  },

  data() {
    return {
      hasInit: false,
      host: '',

      deployForm: {
        deploy_host: null,
        keyDeployPath: '',
        pemDeployPath: '',
        reloadcmd: 'service nginx force-reload',
      },
      rules: {
        deploy_host: [
          {
            message: '服务器不能为空',
            required: true,
            trigger: 'blur',
          },
        ],
        keyDeployPath: [
          {
            message: '私钥部署路径不能为空',
            required: true,
            trigger: 'blur',
          },
        ],
        pemDeployPath: [
          {
            message: '公钥部署路径不能为空',
            required: true,
            trigger: 'blur',
          },
        ],
        reloadcmd: [
          {
            message: '重启命令不能为空',
            required: true,
            trigger: 'blur',
          },
        ],
      },
    }
  },

  computed: {
    domain_list() {
      return this.form.domains.join(' ')
    },

    nginxConfig() {
      return `server {
    listen 443 ssl;
    server_name ${this.domain_list};

    ssl_certificate ${this.deployForm.keyDeployPath};
    ssl_certificate_key ${this.deployForm.pemDeployPath};  
}`
    },
  },

  methods: {
    async getData() {
      console.log(this.form)

      this.deployForm.keyDeployPath =
        this.form.deploy_key_file || `/path/to/${this.form.domains[0]}.key`
      this.deployForm.pemDeployPath =
        this.form.deploy_fullchain_file ||
        `/path/to/${this.form.domains[0]}.pem`
      this.deployForm.reloadcmd = this.form.deploy_reloadcmd || this.reloadcmd
      this.deployForm.deploy_host = this.form.deploy_host

      if (!this.deployForm.deploy_host) {
        await this.getDomainHost()
      }

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
        this.deployForm.deploy_host = res.data.list[0]
      }
    },

    handleClose() {
      this.$emit('on-close')
    },

    async handleSubmit() {
      let loading = this.$loading({ fullscreen: true })

      let params = {
        // 域名列表
        issue_certificate_id: this.form.id,
      }

      const res = await this.$http.renewCertificate(params)

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

      return res
    },

    downloadSSLKeyFile() {
      console.log(JSON.stringify(this.form, null, 2))

      let blob = new Blob([this.form.ssl_certificate_key], {
        type: 'text/plain;charset=utf-8',
      })

      let name = this.form.domains[0]
      FileSaver.saveAs(blob, `${name}.key`)
    },

    async downloadSSLFile() {
      let name = this.form.domains[0]

      const zip = new JSZip()

      zip.file(`${name}.pem`, this.form.ssl_certificate)
      zip.file(`${name}.key`, this.form.ssl_certificate_key)

      zip.generateAsync({ type: 'blob' }).then(function (content) {
        // see FileSaver.js
        FileSaver.saveAs(content, `${name}.zip`)
      })

      // let blob = new Blob([this.form.ssl_certificate], {
      //   type: 'text/plain;charset=utf-8',
      // })
    },

    async handleDeployVerifyFile(hostRow) {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.confirmDeployVerifyFile(hostRow)
        } else {
          return false
        }
      })
    },

    async confirmDeployVerifyFile(hostRow) {
      let loading = this.$loading({ fullscreen: true })

      let params = {
        // 域名列表
        issue_certificate_id: this.form.id,
        host_id: hostRow.id,
        key_deploy_path: this.deployForm.keyDeployPath,
        pem_deploy_path: this.deployForm.pemDeployPath,
        reloadcmd: this.deployForm.reloadcmd,
      }

      const res = await this.$http.deployCertificateFile(params)

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
    this.getData()
  },
}
</script>

<style lang="less">
// .mo-form-detail .code-item .el-form-item__content {
//   padding: 0;
// }
</style>

<style lang="less" scoped>
.verify-step__value {
  font-size: 12px;
  word-break: break-all;
}
</style>
