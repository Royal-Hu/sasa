<template>
    <div>
      <!--<app-header title='支付'></app-header>-->
      <div class="cell">
        <span class="titlecs">问诊人</span>
        <span style="color:rgba(179,179,179,1); float:right; padding-right:12px; vertical-align: middle;font-size: 14px;" >{{ servName }}</span>
        <hr class="full-line" align= center size="1">
      </div>
      <div class="cell">
        <span class="titlecs">总计</span>
        <span style="color: rgba(0,147,255,1); float:right; padding-right:16px; vertical-align: middle;font-size: 14px;">￥{{ price }}</span>
        <hr class="full-line" align= center size="1">
      </div>
      <div class="cell">
        <img class="imgw" :src="payWx">
        <span style="font-size:15px; margin-left:6px; vertical-align: middle;">微信支付</span>
        <hr class="full-line" align= center size="1">
      </div>

      <button type="button" class="btn" @click="submitOrder">确认支付</button>
    </div>
</template>

<script>
import { mapGetters } from "vuex";
import Header from "../Header.vue";
import imgMap from "../../../static/js/imgmap.js";
export default {
  data() {
    return {
      price: this.$route.query.price,
      snapId: this.$route.query.snapId,
      orgId: this.$route.query.orgId,
      drId: this.$route.query.drId,
      servId: this.$route.query.servId,
      busiType: 2000104,
      payWx: imgMap.payWx
    };
  },

  components: {
    appHeader: Header
  },

  computed: {
    ...mapGetters(["loginData"]),
    servName() {
      let userInfo = this.loginData.userObj;
      let servName = userInfo.userName;
      if (!servName) {
        servName = userInfo.nickName;
      }
      return servName;
    }
  },

  methods: {
    submitOrder() {
      let vm = this;
      if (!this.servId) {
        //没有servId,下单
        let request = {
          userId: this.loginData.userObj.userId.value,
          snapId: this.snapId,
          goodsType: this.busiType,
          servName: this.servName,
          despIllness: "无",
          showDiary: 1,
          showDynamic: 1,
          orgId: this.orgId
        };
        this.$indicator.open();
        this.$store
          .dispatch("orderSubmit", request)
          .then(data => {
            vm.servId = data.servId.value;
            vm.wxPay();
          })
          .catch(e => {
            this.$toast(e.message);
            this.$indicator.close();
          });
      } else {
        this.$indicator.open();
        vm.wxPay();
      }
    },
    wxPay() {
      let vm = this;
      let request = {
        busiId: this.servId,
        busiType: this.busiType,
        desp: "在线咨询",
        drId: this.drId,
        money: this.price,
        moneyRmb: this.price,
        orgId: this.orgId.value,
        tradeMode: 8101104,
        userId: this.loginData.userObj.userId.value
      };
      this.$store
        .dispatch("userConsume", request)
        .then(data => {
          //支付成功
          if (data.rtnCode == "1") {
            let json = data.data;
            if (json) {
              json = eval("(" + json + ")");
              vm.invokeWx(json);
            } else {
              this.$indicator.close();
              this.$toast("余额支付成功");
              vm.$router.go(-1);
            }
          } else {
            this.$indicator.close();
            this.$toast("网络异常，支付失败");
            vm.$router.go(-1);
          }
        })
        .catch(e => {
          this.$toast(e.message);
        })
        .finally(() => {
          this.$indicator.close();
        });
    },
    onBridgeReady(request) {
      let vm = this;
      WeixinJSBridge.invoke("getBrandWCPayRequest", request, function(res) {
        if (res.err_msg == "get_brand_wcpay_request:ok") {
          vm.$toast("支付成功");
          vm.$router.go(-1);
        } else {
          this.$toast("支付失败");
        }
      });
    },

    invokeWx(request) {
      if (typeof WeixinJSBridge == "undefined") {
        if (document.addEventListener) {
          document.addEventListener(
            "WeixinJSBridgeReady",
            this.onBridgeReady(request),
            false
          );
        } else if (document.attachEvent) {
          document.attachEvent(
            "WeixinJSBridgeReady",
            this.onBridgeReady(request)
          );
          document.attachEvent(
            "onWeixinJSBridgeReady",
            this.onBridgeReady(request)
          );
        }
      } else {
        this.onBridgeReady(request);
      }
    }
  }
};
</script>

<style scoped>
.cell {
  background: rgba(255, 255, 255, 1);
  line-height: 46px;
}
.full-line {
  background: rgba(4, 11, 28, 0.05);
}
.titlecs {
  font-size: 14px;
  color: rgba(179, 179, 179, 1);
  padding-left: 16px;
  vertical-align: middle;
}

.imgw {
  width: 27px;
  height: 27px;
  margin-left: 16px;
  vertical-align: middle;
}

.btn {
  border-radius: 4px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: white;
  background-color: rgba(0, 147, 255, 1);
  height: 40px;
  margin: 20px 5%;
  width: 90%;
  border: 0 solid transparent;
}
</style>
