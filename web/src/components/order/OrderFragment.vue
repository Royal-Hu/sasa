<template>
    <div>
      <mt-navbar v-model="selected" :fixed="true">
        <mt-tab-item id="1">问诊</mt-tab-item>
        <mt-tab-item id="2">服务包</mt-tab-item>
        <mt-tab-item id="3">预约</mt-tab-item>
      </mt-navbar>

        <mt-tab-container v-model="selected" style="margin-top: 56px;">

          <mt-tab-container-item id="1">
            <order-list></order-list>
          </mt-tab-container-item>

          <mt-tab-container-item id="2">
            <service-order-list></service-order-list>
          </mt-tab-container-item>

          <mt-tab-container-item id="3">
            <appoint-order-list></appoint-order-list>
          </mt-tab-container-item>

        </mt-tab-container>

    </div>
</template>

<script>
  import { mapGetters } from 'vuex';
  import OrderList from './OrderList.vue';
  import ServiceOrderList from './ServiceOrderList.vue';
  import AppointOrderList from './AppointOrderList.vue';
    export default {
        data() {
          return {
            selected: "1",
          }
        },
        components: {
          orderList: OrderList,
          serviceOrderList: ServiceOrderList,
          appointOrderList: AppointOrderList
        },
        computed: {
          ...mapGetters(['loginData', 'loginUrl']),
        },
        created() {
          const userInfo = this.loginData.userObj;
          if(!userInfo) {
            // window.location.href = this.loginUrl + "autoLogin";
            this.myUtils.wxLogin();
          }
        }

    }
</script>

<style scoped>

</style>
