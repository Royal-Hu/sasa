<template>
    <div>
      <div @click="shade" :class=" display || show ? 'shade':''"></div>
      <div class="seach-box">
        <div class="input-box">
          <img src="/static/img/Shape@2x.png" alt="">
          <input class="input" ref="getVal" @blur="getSeachVal" type="text" placeholder="搜索" placeholder-style="colorLred"/>
        </div>
      </div>
      <div class="box">
        <div class="title">
          <div class="cascader" @click="getType">{{departText}}</div>
          <div class="line"></div>
          <div class="cascader" @click="getSelect">{{sortText}}</div>
        </div>
        <ul v-if="!show" style="display:flex; padding: 15px 0;border-bottom: 1px solid rgba(238, 238, 238, 0.6);">
          <li class="select-list"  v-for="(item,index) in getSelectAll" :key="index"  :class="{'on':item.show==true}">
                <input style="display:none"  class="input-radio self-radio" type="checkbox" :id="'checkbox-'+item.id" :value="item.id" v-model="checkValues" @click="open && setCheckValue($event,item)">
                <label :for="'checkbox-'+item.id">
                  <span>{{item.value}}</span>
                </label>
          </li>
        </ul>
        <div class="select-box">
          <div class="select" v-if="display">
              <div class="left">
                <h3 @click="requestDetailListAll(0)">全部科室</h3>
                <div>
                 <p v-for="(dict,index) in selectedOptions" :key="index" v-on:click="addClass(index,$event)" v-bind:class="{ on:index==current}" @click="changeChildDict(dict,index)">{{dict.dictName}}</p>
                </div>
              </div>
              <div class="right">
                <h3 @click="requestDetailListAll(1)">全部</h3>
                <div>
                  <p v-for="(dict, index) in childDictList" :key="index" @click="requestDetailList(dict)">{{ dict.dictName }}</p>
                </div>
              </div>
          </div>
          <div class="upDown-box" v-if="show">
          <p @click="requestDoctorList('1')" :class="showClass1 ? 'on' : ''">热门推荐</p>
          <p @click="requestDoctorList('2')" :class="showClass2 ? 'on' : ''">评分最高</p>
          <p @click="requestDoctorList('3')" :class="showClass3 ? 'on' : ''">接诊率最高</p>
        </div>
        </div>
      </div>
      <ul v-if="doctorList.length > 0" v-infinite-scroll="loadMore" infinite-scroll-disabled="loading"  infinite-scroll-immediate-check="false">
        <doctor-item v-for="(doctorDetail,index) in doctorList" :key="index" :doctorDetail="doctorDetail" @click.native="toDetail(doctorDetail)"></doctor-item>
      </ul>
      <div class="empty" v-if="doctorList.length == 0">
        <img :src="consultationEmpty" width="144px" height="136px">
        <div style="font-size: 15px;margin-top: 10px;color:#b3b3b3">暂无相关结果</div>
      </div>
    </div>
</template>

<script>
import DoctorItem from "./DoctorItem.vue";
import imgMap from '../../../static/js/imgmap.js';
import Header from "../Header.vue";
import Vue from "vue";
export default {
  data() {
    return {
      orgId: this.$route.query.orgId, //机构ID
      type: this.$route.query.type, //首页更多
      deptId: this.$route.query.deptId, //科室ID
      drName: this.$route.query.drName,
      dictName: this.$route.query.dictName,//首页科室名称
      deptId2: null,
      type: null,
      doctorList: [],
      typeList: [],
      loading: false,
      page: 1,
      loaded: false, //是否加载完成
      show: false,
      display: false,
      childDictList: [],
      selectedOptions: [],
      selectedList: [],
      getSelectAll: [
        {
          id: "1",
          value: "在线问诊",
          show: false
        },
        {
          id: "2",
          value: "预约",
          show: false
        },
        {
          id: "3",
          value: "诊后报道",
          show: false
        },
        {
          id: "4",
          value: "服务包",
          show: false
        }
      ],
      checkboxGroup1: ["在线问诊"],
      checkValues: [],
      checkIds: [],
      sortText: "推荐排序",
      departText: "全部科室",
      open: true,
      timerID: null,
      current:null,
      showClass1:false,
      showClass2:false,
      showClass3:false

    };
  },

  components: {
    doctorItem: DoctorItem,
    appHeader: Header
  },
  computed: {
    consultationEmpty() {
      return imgMap.consultationEmpty;
    },
  },
  methods: {
    addClass:function(index,event){
      this.current=index;　　　
    },
    addClassToggle() {
      this.showClass = !this.showClass;
    },
    getSeachVal() {
      let val = this.$refs.getVal.value;
      if(val == '' || val == null || val == undefined){
        return false;
      }
      this.loading = true;
      this.display = false;
      this.doctorList = [];
      let request = {
        orgId: this.orgId,
        drName: val,
        // pageNum: this.page,
        // pageSize: 10
      };
      let that = this;
      let method = "doctorList";
      that.$store
        .dispatch(method, request)
        .then(data => {
          if (data.doctorList) {
            for (let i = 0; i < data.doctorList.length; i++) {
              that.doctorList.push(data.doctorList[i]);
            }
          }
          that.loading = false;
        })
        .catch(e => {
          that.loading = false;
          that.$toast(e.message);
        });
    },
    shade() {
      this.show = false;
      this.display = false;
    },
    destroyed () {
      clearTimeout(this.timerID)
    },
    setCheckValue(ev, item) {
      this.destroyed();
      item.show = !item.show;
      let id = item.id;
      let flage = true;
      for (let i = 0; i < this.checkIds.length; i++) {
        if (this.checkIds[i] == id) {
          this.checkIds.splice(i, 1);
          flage = false;
        }
      }
      if (flage) {
        this.checkIds.push(id);
      }
      this.page = 1;
      let that = this;
      if (that.open) {
        that.requestDoctorList()
      }
      that.open = false;
      that.timerID = setTimeout(function () {
        that.open = true
      }, 1500)

    },
    //推荐排序
    getSelect() {
      this.show = true;
      this.display = false;
    },
    getType() {
      this.display = true;
      this.show = false;
      this.showClass3 =false;
      this.showClass2 =false;
      this.showClass1 =false;
    },
    toDetail(doctorDetail) {
      this.$router.push({
        path: "doctorDetail",
        query: { userId: doctorDetail.userId.value }
      });
    },

    loadMore() {
      if (!this.loaded) {
        if(this.$refs.getVal.value != ''){
          return false
        }
        this.page++
        this.requestDoctorList(this.sortType);
      }
    },

    //医生列表
    requestDoctorList(sortType) {
      this.loading = true;
      this.show = false;
      this.display = false;
      this.sortType = sortType;
      if (sortType == 1) {
        this.sortText = "热门推荐";
        this.showClass1 = true;
        this.showClass2 = false;
        this.showClass3 = false;
      } else if (sortType == 2) {
        this.sortText = "评分最高";
        this.showClass2 = true;
         this.showClass1 = false;
        this.showClass3 = false;
      } else if (sortType == 3) {
        this.sortText = "订单最多";
        this.showClass3 = true;
         this.showClass2 = false;
        this.showClass1 = false;
      } else {
        this.sortText = "推荐排序";
      }
      let request = {
        orgId: this.orgId,
        deptId:  this.type == '1' ? this.deptId2 : this.type == '0' ? '0' :this.deptId,
        drName: this.drName,
        pageNum: this.page,
        pageSize: 10,
        sortType: this.sortType,
        filter: this.checkIds
      };
      let vm = this;
      if(this.page == '1'){
        vm.doctorList = [];
      }
      let method = "doctorList";
      // if (this.type && !sortType) {
      //   method = "newDocList";
      // }
      this.$store
        .dispatch(method, request)
        .then(data => {
          if (data.doctorList.length > 0) {
            for (let i = 0; i < data.doctorList.length; i++) {
              vm.doctorList.push(data.doctorList[i]);
            }
          }
          vm.loaded = vm.doctorList.length == data.total;

          vm.loading = false;
        })
        .catch(error => {
          vm.loading = false;
          vm.loaded = true;
          this.$toast(error.message);
        });
    },

    //一级科室
    requestTypeList() {
      this.loading = true;
      let request = {
        orgId: this.orgId,
        h5query: true
      };
      // let that = this;
      this.$store
        .dispatch("orgDeptGet", request)
        .then(data => {
          if (data.length > 0) {
            for (let i = 0; i < data.length; i++) {
              this.selectedList.push(data[i]);
              if (data[i].upId.value == "0") {
                this.selectedOptions.push(data[i]);
                for(let n = 0;n < this.selectedOptions.length; n++){
                  if(this.selectedOptions[n].dictName == this.dictName){
                    this.current = n;
                    this.changeChildDict(this.selectedOptions[n]);
                  }
                }

              }
            }

          }
          this.loading = false;
        })
        .catch(e => {
          this.loading = false;
          this.$toast(e.message);
        });
    },
    //二级科室
    changeChildDict(dict, index) {
      this.childDictList = [];
      this.deptId2 = dict.dictId.value;
      for (let i = 0; i < this.selectedList.length; i++) {
        if (this.selectedList[i].upId.value == dict.dictId.value) {
          this.childDictList.push(this.selectedList[i]);
        }
      }
    },
    //筛选详情医生
    requestDetailList(dict) {
      this.page = 1;
      this.loading = true;
      this.display = false;
      this.doctorList = [];
      this.departText = dict.dictName;
      this.sortText = "推荐排序";
      this.deptId = dict.dictId.value;
      let request = {
        orgId: this.orgId,
        deptId: this.deptId,
        filter: this.checkIds,
        sortType: this.sortType,
        pageNum: this.page,
        pageSize: 10
      };
      let that = this;
      let method = "doctorList";
      that.$store
        .dispatch(method, request)
        .then(data => {
          if (data) {
            for (let i = 0; i < data.doctorList.length; i++) {
              that.doctorList.push(data.doctorList[i]);

            }

          }
          that.loading = false;
        })
        .catch(e => {
          that.loading = false;
          that.$toast(e.message);
        });
    },
    //筛选全部医生
    requestDetailListAll(type) {
      this.page = 1;
      this.current = null;
      this.loading = true;
      this.display = false;
      if(type == '0'){
        this.departText = '全部科室';
        this.childDictList = [];
        this.type = '0'
      }else{
        this.departText = '全部';
        this.type = '1'
      }

      this.doctorList = [];
      let request = {
        orgId: this.orgId,
        deptId: type == '0' ? '0' : this.deptId2,
        pageNum: this.page,
        pageSize: 10
      };
      let that = this;
      let method = "doctorList";
      that.$store
        .dispatch(method, request)
        .then(data => {
          if (data) {
            for (let i = 0; i < data.doctorList.length; i++) {
              that.doctorList.push(data.doctorList[i]);
            }
          }
          that.loaded = that.doctorList.length == data.total;

          that.loading = false;
        })
        .catch(e => {
          that.loaded = true;
          that.loading = false;
          that.$toast(e.message);
        });
    }
  },

  created() {
    this.requestDoctorList('1');
    this.requestTypeList();
    if(this.dictName){
      this.departText = this.dictName;
      this.deptId2 = this.deptId;
    }else{
      this.departText = '全部科室'
    }
  }
};
</script>

<style scoped>
ul,
li {
  padding: 0;
  list-style: none;
  margin: 0;
}
/deep/ ::-webkit-input-placeholder {
  /* WebKit browsers */
  color: #ccc;
}
/deep/ :-moz-placeholder {
  /* Mozilla Firefox 4 to 18 */
  color: #ccc;
}
/deep/ ::-moz-placeholder {
  /* Mozilla Firefox 19+ */
  color: #ccc;
}
/deep/ :-ms-input-placeholder {
  /* Internet Explorer 10+ */
  color: #ccc;
}
.empty {
  padding: 50px 40px;
  text-align: center;
}
.shade {
  position: fixed;
  top: 0;
  bottom: 0;
  width: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: 200;
}
.box {
  background: #fff;
  position: relative;
  z-index: 400;
}
.title {
  display: flex;
  padding: 10px 0;
  border-bottom: 1px solid rgba(238, 238, 238, 0.6);
}
/* /deep/ .el-checkbox-button,.el-checkbox-button__inner{
  width: 68px;
  height: 25px;
  line-height: 25px;
  border:1px solid #B3B3B3;
  border-radius: 13px;
  font-size: 13px;
  color: #000;
  margin-left: 20px;
  text-align: center;
  background: #fff;
  transition: transform .3s;
} */
/deep/ .el-input__inner {
  border: none;
  text-align: center;
}
/deep/ .el-input__inner > placeholder-style {
  color: #000;
}
/deep/ .el-input__suffix {
  right: 40px;
}
/deep/ .el-input__icon {
  color: #409eff;
}
.cascader {
  width: 50%;
  text-align: center;
  font-size: 15px;
  color: #000;
}
.cascader img {
  width: 10px;
  height: 10px;
  margin-left: 5px;
  transition: transform 0.3s;
}
.active {
  transform: rotateZ(180deg);
}
.line {
  width: 1px;
  height: 25px;
  background: #eee;
  margin: 0;
}
.select-box {
  position: absolute;
  z-index: 600;
  background: #fff;
  width: 100%;
}
.select-list {
  width: 68px;
  height: 25px;
  line-height: 25px;
  border: 1px solid #b3b3b3;
  border-radius: 13px;
  font-size: 13px;
  color: #000;
  margin-left: 20px;
  text-align: center;
  background: #fff;
  transition: transform 0.3s;
}
.select-list.on {
  border: 1px solid #0093ff;
  background: #e5f4ff;
  color: #0093ff;
}
.select {
  display: flex;
}
.select h3 {
  font-weight: normal;
  color: #000;
  font-size: 15px;
  margin-bottom: 10px;
}
.select p {
  color: #000;
  font-size: 15px;
  margin-bottom: 10px;
}
.select p.on{
  color: #0093ff;
}
.left {
  width: 50%;
  background: #f9f9f9;
  padding-left: 20px;
}
.right {
  width: 50%;
  background: #fff;
  padding-left: 25px;
}
.right h3,.left h3{
  margin-top: 10px;
}
.upDown-box {
  position: absolute;
  z-index: 600;
  background: #fff;
  width: 100%;
  padding-left: 30px;
  padding-top: 10px;
}
.upDown-box p {
  color: #222;
  font-size: 15px;
  margin-bottom: 10px;
}
.upDown-box p.on{
  color: #0093ff;
}
.seach-box {
  width: 100%;
  background: #f2f2f2;
  text-align: center;
  padding: 14px 0;
}
.input-box {
  width: 85.6%;
  height: 30px;
  border-radius: 15px;
  background: #fff;
  margin: 0 auto;
}
.input-box img {
  width: 16px;
  height: 18px;
  position: relative;
  top: 4px;
}
.input {
  width: 80%;
  height: 28px;
  line-height: 28px;
  font-size: 14px;
  color: #222;
  border: none;
  padding: 0 10px;
}
</style>
