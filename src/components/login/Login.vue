<template>
  <div style="background-color: white; width: 100%; height: 100%">

    <!-- <div style="width: 100%; text-align: center; padding-top: 30px;"><img :src="appIconUser" alt="" class="app-icon"></div> -->
     <!--  线上使用手机号登录  -->
    <!-- <phonecode-login ref="phoneCodeLogin" @login="startLogin" style="margin-top: 50px"></phonecode-login> -->
     <!-- 本地测试使用帐号登录，方便测试 -->
    <!-- <account-login @login="startLogin" style="margin-top: 50px;"></account-login> -->

  </div>
</template>

<script>
  import { mapGetters, mapActions } from 'vuex'
  // import AccountLogin from './AccountLogin.vue'
  // import PhoneCodeLogin from './PhoneCodeLogin.vue'
  import * as type from '../../constant/ConstantConfig.js';
  import imgMap from '../../../static/js/imgmap.js';
  export default {
    data() {
      return {
        selected: "1"
      }
    },

    computed: {
      ...mapGetters(['isUserApp', 'phoneFragment', 'loginData', 'loginUrl', 'appCode']),
      appIconUser() {
        return imgMap.appIconUser;
      }
    },

    filters: {
      setTitle: (value) => {
        if(value) return '登录';
        return '医联邦用户版';
      }
    },

    components: {
      // accountLogin: AccountLogin,
      // phonecodeLogin: PhoneCodeLogin
    },

    methods: {
      ...mapActions(['updatePhoneFragment']),
      getQueryString(name) {
        let reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
        let r = window.location.search.substr(1).match(reg);
        if(r != null)return unescape(r[2]); return null;
      },
      startLogin(request) {
        this.$indicator.open();
        let isConsultation = this.getQueryString("isConsultation");
        let vm = this;
        let method = "appLogin";
        if(isConsultation) {
          method = "userLogin";
        }
        this.$store.dispatch(method, request).then(() => {
          if(vm.loginData.userObj) {  //登录成功
            // this.$router.go(-2);
            this.$router.push({
              path: "mine"
            });
          }
        }).catch(e => {
          this.$toast(e.message);
        }).finally(() => {
          this.$indicator.close();
        });
      }
    },
    created() {
      let code = this.getQueryString("code");
      let reurl = this.getQueryString("reurl");
      if(code) {  //未授权登录，则跳转授权
        const request = {
          loginType: '4',
          // account: "1",
          sysType: '1003104',
          code: code
        };
        this.startLogin(request);
      } else {
        const local = encodeURIComponent(
          'http://16health.com/login'
          //  window.location.href
        );
        const appId = 'wx923325685a35b7d4';
        window.location.href =
          "https://open.weixin.qq.com/connect/oauth2/authorize?appid=" +
          appId +
          "&redirect_uri=" +
          local +
          "&response_type=code&scope=snsapi_userinfo&state=1#wechat_redirect";
      }
    }
  }
</script>

<style scoped>
  .app-icon {
    width: 80px;
    height: 80px;
    border-radius:6px;
  }
</style>

<!--
<template>
  <div style="background-color: white; width: 100%; height: 100%">
    <mt-header :title="isUserApp | setTitle" style="background-color: white; color: black">
      <mt-button slot= "left" icon="back" v-if="phoneFragment" @click.native="updatePhoneFragment(false)"></mt-button>
    </mt-header>

    <hr class="full-line">

    <div style="width: 100%; text-align: center; margin-top: 30px;" v-if="!isUserApp"><img :src="appIconDoctor" alt="" class="app-icon"></div>

    <mt-navbar v-model="selected" v-if="isUserApp">
      <mt-tab-item id="1">帐号密码登录</mt-tab-item>
      <mt-tab-item id="2">手机号快速登录</mt-tab-item>
    </mt-navbar>

    <mt-tab-container v-model="selected" style="margin-top: 50px" v-if="isUserApp">
      <mt-tab-container-item id="1">
        <account-login></account-login>
      </mt-tab-container-item>
      <mt-tab-container-item id="2">
        <phonecode-login></phonecode-login>
      </mt-tab-container-item>
    </mt-tab-container>

    <account-login v-show="(!isUserApp && !phoneFragment)" style="margin-top: 50px"></account-login>
    <phonecode-login v-show="phoneFragment" style="margin-top: 50px"></phonecode-login>

  </div>
</template>

<script>
   import { mapGetters, mapActions } from 'vuex'
  import AccountLogin from './AccountLogin.vue'
  import PhoneCodeLogin from './PhoneCodeLogin.vue'
  import * as type from '../../constant/ConstantConfig.js';
  import imgMap from '../../../static/js/imgmap.js';
    export default {
        data() {
          return {
            selected: "1"
          }
        },

        computed: {
          ...mapGetters(['isUserApp', 'phoneFragment', 'loginData']),
          appIconDoctor() {
            return imgMap.appIconDoctor;
          }
        },

        filters: {
          setTitle: (value) => {
            if(value) return '登录';
            return '医联邦医生版'
          }
        },

      components: {
          accountLogin: AccountLogin,
          phonecodeLogin: PhoneCodeLogin
      },

      methods: {
        ...mapActions(['updatePhoneFragment']),
        getQueryString(name) {
          let reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
          let r = window.location.search.substr(1).match(reg);
          if(r != null)return unescape(r[2]); return null;
        }
      },
      created() {
        let code = this.getQueryString("code");
        if(code) {
          this.$indicator.open();
          const request = {
            loginType: type.LOGIN_TYPE_CODE,
            sysType: this.$store.state.sysType,
            code: code,
            account: "1"
          };

          let vm = this;
          this.$store.dispatch("appLogin", request).then(() => {
            if(vm.loginData.userObj) {  //登录成功
              this.$router.replace("/doctorList");
            }
          }).catch(e => {
            this.$toast(e.message);
          }).finally(() => {
            this.$indicator.close();
          });
        }
      }
    }
</script>

<style scoped>
  .app-icon {
    width: 80px;
    height: 80px;
    border-radius:6px;
  }
</style>
-->
