import axios from 'axios'
import * as types from './constant/ConstantConfig.js'
import { DES3 } from './assets/DES3.js'
import { hex_md5 } from './assets/md5.js'
import store from './store/store.js'
'use strict';
const LosslessJSON = require('lossless-json');



axios.defaults.timeout = 25000;
// axios.defaults.baseURL = "http://smanager.sinoylb.com/sk";
// axios.defaults.baseURL = "http://ylb1688.sinoylb.com/sk";

// axios.defaults.headers.common['Content-Type'] = 'application/json;charset=UTF-8';
// axios.defaults.headers.common['accessToken'] = 'a0e2ad6e12ea43ee94a3003525134ce7';
// axios.defaults.headers.common['Content-Type2'] = 'application/x-www-form-urlencoded;charset=UTF-8';

export var financeConfig = {
  responseType: 'text',
  transformResponse: data => {
    try {
      data = LosslessJSON.parse(data);
    } catch (e) {
    }
    return data;
  },
  abUrl: "/finance/"  //财务线上地址
  // abUrl: "http://aiyizfb8899.aiyi01.com/sk/"   //本地测试环境测试地址
  // abUrl: "http://ylb1688.sinoylb.com/sk/"       //本地正式环境测试地址
  // abUrl: "http://16health.com/finance/" //本地正式环境测试地址
};

export var config = {
  responseType: 'text',
  transformResponse: data => {
    try {
      data = LosslessJSON.parse(data);
    } catch (e) {
    }
    return data;
  },
   abUrl: "/apis/"     //线上环境
  // abUrl: "http://admintest.16health.com:9000/sk/" //本地测试环境
  //  abUrl: "http://16health.com/apis/" //测试环境页面    正式环境数据接口
  // abUrl: "http://16health.com/apisTest/"  //测试地址
};

export var consultationConfig = {
  responseType: 'text',
  transformResponse: data => {
    try {
      data = LosslessJSON.parse(data);
    } catch (e) {
    }
    return data;
  },
  abUrl: "/sk/"
  // abUrl: "http://smanager.sinoylb.com:9901/sk/"  //心理咨询本地正式环境测试地址
  //  abUrl: "http://16health.com/apis/" //测试环境页面    正式环境数据接口
  // abUrl: "http://16health.com/apisTest/"  //测试地址
};

export var shoppingConfig = {
  responseType: 'text',
  transformResponse: data => {
    try {
      data = LosslessJSON.parse(data);
    } catch (e) {}
    return data;
  },
  abUrl: "http://47.92.159.136:8020/"  //商城正式环境
  // abUrl: "http://47.92.25.25:8020/" //商城本地测试环境测试地址
};

export var shoppingConfigPay = {
  responseType: 'text',
  transformResponse: data => {
    try {
      data = LosslessJSON.parse(data);
    } catch (e) {}
    return data;
  },
  abUrl: "http://47.92.159.136:8088/"  //商城财务正式环境
  // abUrl: "http://47.92.25.25:8088/" //商城财务本地测试环境测试地址
};

function getVer() {
  let d = new Date();
  let curr_date = d.getDate();
  let curr_month = d.getMonth() + 1;
  let curr_year = d.getFullYear();
  String(curr_month).length < 2 ? (curr_month = "0" + curr_month): curr_month;
  String(curr_date).length < 2 ? (curr_date = "0" + curr_date): curr_date;
  return curr_year + "" + curr_month +""+ curr_date;
}

axios.interceptors.request.use(function (config) {
    let index = types.URL_FILTERS.indexOf(config.url);
    let needLogin = (index == -1);
    config.url = config.abUrl + config.url;
    // console.log(config);

    config.headers["ver"] = getVer();
    config.headers["appType"] = store.state.appType;
    config.headers["appVer"] = types.APP_VER;
    let milliseconds = (new Date()).valueOf();
    config.headers["seqId"] = milliseconds;
    let json = JSON.stringify(config.data);
    let message = json + milliseconds;
    let des = DES3.encrypt(types.KEY, message);
    let signData = hex_md5(des).toLocaleUpperCase();
    config.headers["signData"] = signData;
    let tid = store.state.userinfo.loginData.tid;
    if(tid && needLogin) {
      config.headers["tid"] = tid;
    }
    return config;
}, function (error) {
  return Promise.reject(error);
});

axios.interceptors.response.use(function (response) {
  // if(response.data.rtnCode.value != types.CODE_OK) {
  //     return Promise.reject(response);
  // }
  return response;
}, function (error) {
  let message = "网络错误";
  if(error.response.status == 900) {
    message = "用户凭证过期，重新登录";
    this.myUtils.wxLogin();
    // this.$router.push({
    //   path: "login",
    // });
  }
  error.data = {rtnMsg: message};
  // error2.data = {msg: message};
  return Promise.reject(error);
});

export default axios;
