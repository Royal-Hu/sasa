<template>
  <div class="page-tabbar">
    <div class="page-wrap">
      <mt-tab-container class="page-tabbar-container" v-model="selected">
        <mt-tab-container-item id="home">
          <home></home>
        </mt-tab-container-item>

        <mt-tab-container-item id="mine">
          <mine></mine>
        </mt-tab-container-item>
      </mt-tab-container>
    </div>

    <mt-tabbar v-model="selected" fixed>
      <mt-tab-item id="home" @click.native="changeTitle">
        <img slot="icon" :src="homeImg">
        首页
      </mt-tab-item>

      <mt-tab-item id="mine" @click.native="toMine">
        <img slot="icon" :src="mineImg">
        我的
      </mt-tab-item>
    </mt-tabbar>
  </div>
</template>

<script>
    import ConsultationHome from './ConsultationHome.vue';
    import ConsultationMine from './ConsultationMine.vue';
    import imgMap from '../../../static/js/imgmap.js';
    import { mapGetters, mapMutations } from 'vuex';
    export default {
        name: "ConsultationMain",

        data() {
          return {
            orgId: this.$route.query.orgId,
          }
        },

        components: {
            home: ConsultationHome,
            mine: ConsultationMine
        },

        computed: {
          ...mapGetters(['loginData', 'loginUrl']),
          selected: {
            get: function() {
              return this.$store.state.consultation.selected;
            },
            set: function (value) {
              this.setSelected(value);
            },
          },

          homeImg() {
            if(this.selected == 'home') return imgMap.consultationHomeSelected;
            return imgMap.consultationHomeDefault;
          },
          mineImg() {
            if(this.selected == 'mine') return imgMap.consultationMineSelected;
            return imgMap.consultationMineDefault;
          },
        },

        methods: {
          ...mapMutations(['setOrgId', 'setSelected']),
          toMine() {
            document.title = "我的";
            const userInfo = this.loginData.userObj;
            if(!userInfo) {
              // window.location.href = this.loginUrl + "autoLogin&isConsultation=1";
              this.myUtils.wxLogin();
            }
          },
          changeTitle() {
            let title = '';
            if(this.selected == 'home') {
              title = '首页';
            } else if(this.selected == 'mine') {
              title = '我的';
            }
            document.title = title;
          }
        },

        created() {
          this.setOrgId(this.orgId);
        },

        activated() {
          const userInfo = this.loginData.userObj;
          if(userInfo) {
            const request = {userId: userInfo.userId.value };
            this.$store.dispatch("jvUserInfoGet", request).catch(err => {
               this.$store.commit("clearUser");
               this.$store.commit("clearCache");
            });
          } else {
            this.setSelected('home');
          }
      }

    }
</script>

<style scoped>

  .page-tabbar {
    overflow: hidden;
    height: 100vh;
  }

  .page-wrap {
    overflow: auto;
    height: 100%;
    padding-bottom: 55px;
    box-sizing: border-box;
    -webkit-overflow-scrolling: touch;
  }

</style>
