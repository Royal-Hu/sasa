<template>
    <div>
      <div class="header">
        填写患者报到单，方便医生确认您的身份，申请通过后可以与医生进行线上沟通交流。
      </div>
      <div class="bgv1">
        <div class="flex-b">
          <span class="title">医生姓名</span>
          <input placeholder="请输入姓名" class="inputcs" v-model="docName" disabled  placeholder-style="color:#ccc">
        </div>
        <div class="flex-b">
          <span class="title">患者姓名</span>
          <input placeholder="请输入姓名" class="inputcs" v-model="serverName" placeholder-style="color:#ccc">
        </div>
        <div class="flex-b">
          <span class="title">手机号</span>
          <input placeholder="请输入手机号" type="tel" class="inputcs" v-model="serverPhone" placeholder-style="color:#ccc">
        </div>
        <div class="flex-b">
          <span class="title">就诊日期</span>
          <input placeholder="请选择日期"  placeholder-style="color:#ccc" class="inputcs" @click.stop="openDatePicker" v-model="serverTime">
        </div>
        <div class="flex-b">
          <span class="title">确诊疾病</span>
          <input placeholder="未确诊可不填写" class="inputcs" v-model="diseaseName" placeholder-style="color:#ccc">
        </div>
        <div class="textarea_box">
          <div class="title">病情资料</div>
          <textarea class="textA"  placeholder ="请详细描述您的病情相关资料" placeholder-style="color:#ccc" clos="10" rows="3" warp="virtual" v-model="desp"></textarea>
          <img class="img" v-if="false">
          <div class="ttt" v-if="false">添加病症图片或检查图片，方便医生确诊（可选）</div>
        </div>
      </div>

      <div class="bgv2">
        <div style="text-align: center;padding-top: 10px; font-size: 15px; color: #040B1C; font-weight: 600">评价</div>
        <div style="display: flex;align-items: center;padding-top: 20px" v-for="(det,index) in deptList" :key="index">
          <span style="font-size: 14px;margin-right: 30px">{{ det.dictName }}</span>
          <el-rate v-model="scoreList[index]"  allow-half style="display: inline-block"></el-rate>
        </div>

        <div style="margin:20px 0 10px 0;">
          <span class="jibing" v-for="(draw,index) in drawList" :key="index" @click="changeCheck(index)" :class="[draw.checked ? 'checked': 'unchecked']">{{ draw.dictName }}</span>
        </div>
        <textarea class="textA"  placeholder ="写个您对医生的评价" clos="5" rows="2" warp="virtual" v-model="comment"></textarea>
        <button type="button" class="btn" @click="commit">提交</button>
      </div>

      <mt-datetime-picker
        ref="datePicker"
        type="date"
        year-format="{value}年"
        month-format="{value}月"
        date-format="{value}日"
        @confirm="handleChange">
      </mt-datetime-picker>

    </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import * as types from '../../constant/ConstantConfig.js';
    export default {
        data() {
           return {
             drId: this.$route.query.drId,
             docName: this.$route.query.docName,
             orgId: this.$route.query.orgId,
             deptList: [],
             drawList: [],
             scoreList:[],
             serverTime: '',
             serverName: '',
             serverPhone: '',
             diseaseName: '',
             desp: '',
             comment: ''
           }
        },

      computed: {
        ...mapGetters(['loginData']),
        userName() {
          const userObj = this.loginData.userObj;
          if(userObj) {
            if(userObj.nickName) return userObj.nickName;
            if(userObj.userName) return userObj.userName;
          }
          return '';
        },

        bindAccount() {
          const userObj = this.loginData.userObj;
          if(userObj) {
            if(userObj.userAccountList) {
              for (let i = 0; i < userObj.userAccountList.length; i++) {
                let contact = userObj.userAccountList[i];
                if (contact.accountType.value == types.ACCOUNT_TYPE_PHONE) {
                  return contact.account;
                }
              }
            }
          }
        }
      },

        methods: {
          changeCheck(index) {
            const draw = this.drawList[index];
            if(draw.checked) {
              draw.checked = !draw.checked;
            } else {
              draw.checked = true;
            }
            this.$set(this.drawList, index, draw);
          },

          deptDictList() {
            const request = {dictType:2002, upId: 0};
            let vm = this;
            this.$store.dispatch("commentDictList", request).then((dataList) => {
              vm.deptList = dataList;
              for (let i = 0; i < vm.deptList.length; i++) {
                   vm.scoreList[i] = 5;
              }
            }).catch(e => {
              this.$toast(e.message);
            });
          },

          drawDictList() {
            const request = {dictType:0, upId: 1020101};
            let vm = this;
            this.$store.dispatch("commentDictList", request).then((dataList) => {
              vm.drawList = dataList;
            }).catch(e => {
              this.$toast(e.message);
            });
          },

          openDatePicker() {
            this.$refs.datePicker.open();
          },

          checkEvaList() {
            const evaList = [];
            for (let i = 0; i < this.deptList.length; i++) {
              const dept = this.deptList[i];
              const eva = {evaType: dept.dictId.value, evaTypeName: dept.dictName, score: this.scoreList[i]};
              evaList.push(eva);
            }
            return evaList;
          },

          checkDrawList(busiId) {
            const drawList = [];
            for (let i = 0; i < this.drawList.length; i++) {
              const draw = this.drawList[i];
              if(draw.checked) {
                const itemRequest = {drawObj: this.drId, drawType: draw.dictId.value, busiType: types.PER_DRAW, detBusiType: types.PERREGIST_DRAW,
                  busiId: busiId, detBusiId: busiId};
                drawList.push(itemRequest);
              }
            }
            return drawList;
          },

          handleChange(value) {
            this.serverTime = value.format("yyyy-MM-dd");
          },

          addComment(data) {
            let vm = this;
            let request = {busiType: types.PERREGIST_EVALUATE, busiId: data.perId.value,
              orgId: this.orgId, userTo: this.drId, comment: this.comment, evaDetList: this.checkEvaList(), userFrom: this.loginData.userObj.userId.value};
            this.$store.dispatch("busiEva", request).then((data) => {
              vm.$toast("操作成功");
              vm.$router.go(-1);
            }).catch(e => {
              this.$toast(e.message);
            }).finally(() => {
              this.$indicator.close();
            });
          },

          addDraw(data) {
            let request = {drawList: this.checkDrawList(data.perId.value)};
            this.$store.dispatch("busiDraw", request).then((data) => {
            }).catch(e => {
              this.$toast(e.message);
            });
          },

          commit() {
            if(!this.serverName) {
              this.$toast("患者姓名不能为空");
              return;
            }
            if(!this.serverPhone) {
              this.$toast("患者手机不能为空");
              return;
            }
            if(!this.serverTime) {
              this.$toast("请选择日期");
              return;
            }
            if(!this.desp) {
              this.$toast("请填写病情资料");
              return;
            }

            const drawList = this.checkDrawList('0');
            if(drawList.length == 0) {
              this.$toast("请选择你对医生的印象");
              return;
            }

            this.$indicator.open();
            let vm = this;
            let request = {drId: this.drId, serverName: this.serverName, serverPhone: this.serverPhone, serverTime: this.serverTime,
              diseaseName: this.diseaseName, desp: this.desp, imgList:[]};
            this.$store.dispatch("perRegistAdd", request).then((data) => {
               vm.addComment(data);
               vm.addDraw(data);
            }).catch(e => {
              this.$toast(e.message);
            });

          }
        },

        created() {
          this.deptDictList();
          this.drawDictList();

          this.serverName = this.userName;
          this.serverPhone = this.bindAccount;
          this.serverTime = new Date().format("yyyy-MM-dd");

        }
    }
</script>

<style scoped>
  input{
    background: #fff;
  }
  .textarea_box{
    padding-top: 10px;
  }
  .flex-b{
    border-bottom: 1px solid rgba(0,0,0,.08);
    padding: 8px 0;
  }
  .header{
    background-color: #5FBEFF;
    color: white;
    font-size: 13px;
    font-weight: 300;
    padding: 6px 16px 6px 16px;
  }

  .bgv1{
    background-color: #fff;
    padding: 0px 16px 10px 16px;
  }
  .bgv2{
    background-color: white;
    margin-top: 13px;
    padding: 0px 16px 10px 16px;
  }
  .line00{
    margin-top: 0%;
    margin-left: 0%;
    color: #CCCCCC;
  }
  .linecell{
    display: inline-block;
    line-height: 55px;
    width: 100%;
    padding-top: 8px;
    padding-bottom: 2px;
  }
  .title{
    font-weight: 400;
    font-size: 16px;
    line-height: 25px;
    padding-bottom: 2px;
    float: left;
    color: #666666;
  }
  .inputcs{
    text-align: right;
    float: right;
    font-size: 16px;
    color: black;
    border-width: 0px; /* 边框宽度 */
    margin-top: 2px;
    outline: none; /* 不显示轮廓线 */
  }
  .textA{
    border:none;
    resize: none;
    font-size: 14px;
    margin-top: 10px;
    width: 100%;

  }
  .img{
    height: 100px;
    width: 100px;
    margin-right: 5px;
  }
  .ttt{
    font-size: 14px;
    color: #666666;
    height: 20px;
    line-height: 15px;
  }
  .jibing{
    display: inline-block;
    font-size: 14px;
    padding: 0 9px;
    text-align: center;
    margin-right: 15px;
    line-height: 30px;
    white-space:nowrap;
    margin-top: 10px;
    margin-bottom: 10px;
  }

  .checked {
    color: #0093FF;
    border: 1px solid #0093FF;
  }

  .unchecked {
    color: #222222;
    border: 1px solid #ddd;
  }

  .btn{
    font-size:17px;
    font-weight: 300;
    color: floralwhite;
    background-color: rgba(0,147,255,1);
    height: 44px;
    border-radius: 4px;
    margin-top: 25px;
    width: 100%;
    border-width: 0px; /* 边框宽度 */
    outline: none; /* 不显示轮廓线 */
  }
</style>
