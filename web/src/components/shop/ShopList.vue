<template>
    <div>
      <!-- 体检套餐list -->
      <div class="cell_box" style="padding-top:20px" v-if="serviceList.length > 0">
        <div v-infinite-scroll="loadMore" infinite-scroll-disabled="loading" infinite-scroll-distance="10" infinite-scroll-immediate-check="false">
          <health-service-item v-for="(item , index) in serviceList" :key="index" :healthServiceItem="item" :orgId="orgId"></health-service-item>
        </div>
        <!-- 没有更多提示 -->
        <bottomloadMore v-if="loaded && serviceList.length > 5"></bottomloadMore>
      </div>
      <div class="empty" v-if="empty">
        <img :src="consultationEmpty">
        <div>暂无相关结果</div>
      </div>
    </div>
</template>

<script>
import HealthServiceItem from "../service/HealthServiceItem.vue";
import BottomloadMore from "../../customComponents/BottomloadMore.vue";
import imgMap from "../../../static/js/imgmap.js";
import * as types from "../../constant/ConstantConfig.js";
export default {
  data() {
    return {
      orgId: this.$route.query.orgId,
      packProdGroupId: this.$route.query.packProdGroupId,
      serviceList:[],
      loading: false,
      page: 1,
      empty: false,
      loaded: false ,//是否加载完成
    };
  },

  components: {
    healthServiceItem: HealthServiceItem,
    bottomloadMore : BottomloadMore
  },


  computed: {
    consultationEmpty() {
      return imgMap.consultationEmpty;
    },
  },

  mounted() {
  },

  methods: {
    //分页
    loadMore() {
      if (!this.loaded) {
        this.page++;
        this.getPackagesList();
      }
    },

    //健康服务--套餐列表
    getPackagesList() {
      this.$indicator.open();
      this.loading = true;
      const request = {
        pageParam:{
          pageSize: 10,
          pageNum: this.page,
        },
        packProdGroupId: this.packProdGroupId
      };
      this.$store
        .dispatch("groupPackagesList", request)
        .then(data => {
          if (data.data.list.length > 0) {
            for(let i = 0; i < data.data.list.length; i++){
              this.serviceList.push(data.data.list[i]);
            }
            this.loaded = (this.serviceList.length >= data.data.total.value);
            this.loading = false;
          }else{
            this.empty = true
          }
        })
        .catch(error => {
          this.loading = false;
          this.loaded = true;
          this.$toast(error.message);
        })
        .finally(() => {
          this.$indicator.close();
        });
    },

  },

  created() {
    this.getPackagesList();
  },


};
</script>

<style scoped>
ul,
li , h3 ,p {
  padding: 0;
  list-style: none;
  margin: 0;
}
.cell_box{
  background: rgba(255, 255, 255, 1);
  overflow: hidden;
  padding: 0 16px;
  /* width: 100%; */
  margin-left: -20px;
}
.banner_index{
  position: absolute;
  top:133px;
  right:10px;
  width: 42px;
  height: 27px;
  line-height: 27px;
  background: rgba(0, 0, 0, .6);
  color: #fff;
  text-align: center;
}
.detail_addres{
  background: #fff;
  padding: 16px;
  position: relative;
}
.detail_addres h3{
  color: #000;
  font-size: 20px;
  font-weight: 500;
}
.right_img{
  position: absolute;
  right: 16px;
  top: 16px;
}
.right_img img{
  width: 24px;
  height: 24px;
}
.tel{
  color: #000;
  font-size: 14px;
  font-weight: 400;
  margin-top: 10px;
}
.tel img{
  width: 15px;
  height: 15px;
  margin-right: 5px;
  position: relative;
  top: 3px;
}
.addres{
  overflow: hidden;
}
.addres img,.addres div{
  float: left;
}
.addres div{
  width: 80%;
}
.distance{
  font-size: 11px;
  color: #B3B3B3;
  font-weight: 400;
}
.screening{
  margin-top: 10px;
  background: #fff;
  overflow: hidden;
}

</style>
