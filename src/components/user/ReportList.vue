<template>
  <div>
    <ul  v-if="reportList.length > 0" v-infinite-scroll="loadMore" infinite-scroll-disabled="loading" infinite-scroll-distance="50" infinite-scroll-immediate-check="false">
      <report-item v-for="(item,index) in reportList" :key="index" :reportItem="item"  @click.native="goDetail(item)"></report-item>
    </ul>
    <div class="empty" v-if="reportList.length == 0">
      <img :src="consultationEmpty" width="144px" height="136px">
      <div style="font-size: 15px;margin-top: 10px;color:#b3b3b3">暂无相关记录</div>
    </div>
  </div>
</template>

<script>
    import ReportItem from './ReportItem.vue';
    import imgMap from '../../../static/js/imgmap.js';
    export default {
        data() {
           return {
             loading: true,
             loaded: true,
             reportList: [],
             orgId: this.$route.query.orgId,
           }
        },
        components: {
            reportItem: ReportItem
        },
        computed: {
          consultationEmpty() {
            return imgMap.consultationEmpty;
          },
        },
        methods: {
            loadMore() {
              if(!this.loaded) {
                this.requestReportList();
              }
            },

            goDetail(item) {
                this.$router.push({
                  path: 'patientReport',
                  query: {
                     docId: item.docid.value
                  }
                })
            },

            requestReportList() {
              let request = {
                orgId: this.orgId
              };
              this.$store.dispatch("imnewpatientlist", request).then((data) => {
                if(data.data) {
                  for(let i = 0; i < data.data.length; i++) {
                    this.reportList.push(data.data[i]);
                  }
                }
              }).catch(error => {
                this.$toast(error.message);
              });
            }
        },

        created() {
            this.requestReportList();
        }
    }
</script>

<style scoped>
  ul,li{ padding:0;list-style:none; margin: 0;}
  .empty {
    padding: 50px 40px;
    text-align: center;
  }
</style>
