<template>
  <div class="">
    <el-tabs v-model="activeName">
      <el-tab-pane
        label="文件验证"
        name="file"
        lazy
      >
        <VerifyStepFile
          :form="form"
          :list="fileList"
          @on-success="handleSuccess"
        ></VerifyStepFile>
      </el-tab-pane>
      <el-tab-pane
        label="DNS验证"
        name="dns"
        lazy
      >
        <VerifyStepDNS
          
          :form="form"
          :list="dnsList"
          @on-success="handleSuccess"
        ></VerifyStepDNS>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
// created at 2023-07-23
import FileSaver from 'file-saver'


import VerifyStepDNS from './VerifyStepDNS.vue'
import VerifyStepFile from './VerifyStepFile.vue'

export default {
  name: 'VerifyStep',

  props: {
    form: {
      type: Object,
    },
  },

  emits: ['on-success'],

  components: {
    VerifyStepDNS,
    VerifyStepFile,
  },

  data() {
    return {
      list: [],
      activeName: 'file',
    }
  },

  computed: {
    fileList() {
      return this.list.filter((item) => {
        return item.challenge && item.challenge.type == 'http-01'
      }).map(item=>{
        item.verify_path = '/.well-known/acme-challenge/' + item.token
        item.verify_url = 'http://' + item.domain + item.verify_path
        return item
      })
    },

    dnsList() {
      return this.list.filter((item) => {
        return item.challenge && item.challenge.type == 'dns-01'
      })
    },
  },

  methods: {
    async getData() {
      this.loading = true

      let params = {
        issue_certificate_id: this.form.id,
      }

      try {
        const res = await this.$http.getCertificateChallenges(params)
        this.list = res.data.list.map((item) => {
          if (item.challenge) {
            item = {
              ...item.challenge,
              ...item,
            }
          }

          if (item.status == 'valid') {
            item.status_value = true
          } else if (item.status == 'invalid') {
            item.status_value = false
          } else {
            item.status_value = null
          }

          return item
        })
        console.log(this.list);

        this.total = res.data.total
      } catch (e) {
        console.log(e)
        // this.msg.error(e.msg);
      } finally {
        this.loading = false
      }
    },

    handleSuccess(){
      this.$emit('on-success')
    }
  },

  mounted() {},

  created() {
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
