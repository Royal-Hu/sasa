<template>
    <div>
      <mt-field placeholder="请输入手机号" type="number" v-model="phone" @input.native="change($event, 1)"></mt-field>
      <!--<hr class="full-line">-->
      <mt-field label="" placeholder="输入验证码" type="number" v-model="code" @input.native="change($event, 2)">
        <mt-button plain size="small" type="primary" @click.native="getCode" :disabled="codeDisable" ref="code">获取验证码</mt-button>
      </mt-field>
      <hr class="full-line">
      <div style="margin: 30px 16px 16px 16px">
        <mt-button size="large" type="primary" @click.native="login" :disabled="disable">登录</mt-button>
      </div>
      <div v-if="!isUserApp" style="margin-top: 16px; margin-bottom: 16px; text-align: center">如需找回帐号密码，请联系机构管理员</div>
    </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import * as type from '../../constant/ConstantConfig.js';
    export default {
        data() {
          return{
            phone: '',
            code: '',
            key: '',
            disable: true,
            codeDisable: false,
            intervalId: -1
          }
        },

      computed: {
        ...mapGetters(['isUserApp', 'loginData'])
      },

      methods: {
        getCode() {
          if(!this.phone) {
            this.$toast('请输入手机号');
          } else {
            if(!this.checkPhone(this.phone)) {
              this.$toast('请输入正确的手机号');
            } else {
              this.codeDisable = true;
              //发送验证码
              const request = {
                busiId: type.PHONE_CODE_BUSID,
                mobile: this.phone,
                busiType: type.TYPE_PHONE_LOGIN
              };
              this.$store.dispatch("phoneCode", request).then((key) => {
                this.key = key;
                let time = 60;
                let vm = this;
                this.intervalId = setInterval(() => {
                  time--;
                  if(time <= 0) {
                    vm.codeDisable = false;
                    vm.$refs.code.$el.innerHTML = "获取验证码";
                    clearInterval(this.intervalId);
                    this.intervalId = 0;
                  } else {
                    vm.$refs.code.$el.innerHTML = time + "S";
                  }
                }, 1000);
              }).catch(e => {
                this.$toast(e.message);
                this.codeDisable = false;
              });
            }

          }
        },
        change(value,type) {
          if(type == 1) {
            this.phone = value.target.value;
          } else if(type == 2) {
            this.code = value.target.value;
          }
          this.disable = !this.phone || !this.code;
        },
        checkPhone(phone) {
          let reg = /^1[0-9]{10}$/;
          return reg.test(phone);
        },
        login() {
          if(!this.checkPhone(this.phone)) {
            this.$toast('请输入正确的手机号');
          } else {
            if(this.key == null || this.key.length == 0) {
              this.$toast('请先获取验证码');
              return
            }
            this.$indicator.open();
            let vm = this;
            const request = {
              loginType: '2',
              account: "1",
              pwd: this.code,
              sysType: '1000100102',
            };
            this.$store.dispatch('appLogin', request).then(data => {
              if(data.rtnCode == '1'){
                this.$toast('登录成功');
              }else{
                this.$toast(data.rtnMsg);
              }

            }).catch(e => {
              this.$toast(e.message);
            }).finally(() => {
              this.$indicator.close();
            });
            //微信登录
            // const request = {
            //   account: this.phone,
            //   pwd: this.code,
            //   key: this.key,
            //   loginType: type.LOGIN_WECHAT,
            //   sysType: this.$store.state.sysType,
            //   openId: this.loginData.openId,
            //   wxname: this.loginData.wxname
            // };
            // this.$emit("login", request);
          }
        },
        clearTick() {
          if(this.intervalId != 0) {
            clearInterval(this.intervalId);
          }
        }
      }
    }
</script>

<style scoped>

</style>
