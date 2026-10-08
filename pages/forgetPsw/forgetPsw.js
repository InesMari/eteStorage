import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'
Page({
  /**
   * 页面的初始数据
   */
  data: {
    phone:'',
    stamp:true,
    msg:'获取验证码'
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },
  inputSetData(e) {
    let {value} = e.detail;
    let { key } = e.currentTarget.dataset;
    this.setData({[key]:value});
  },
  goNext(){
    let that = this;
    let {smsValidCode,phone} = this.data;
    util.postByBeanName("wxUserTF","checkSmsValidCode", {billId:phone,smsVaildCode:smsValidCode},function(data){
      if(data){
        wx.navigateTo({
          url: '/pages/resetPsw/resetPsw?billId='+that.data.phone+'&smsVaildCode='+smsValidCode,
        })
      }
    })
  },
  getCode(){
    if(!this.data.phone){
      wx.showModal({
        title: "提示",
        content: '请输入手机号码',
        confirmText: "确定",
        showCancel: false
      })
      return false;
    }
    if(this.data.phone.length!=11){
      wx.showModal({
        title: "提示",
        content: '请输入有效的手机号',
        confirmText: "确定",
        showCancel: false
      })
        return false;
    }
    let that = this;
    this.sendSmsValidCode(function(){
      that.setData({verifyPhone:false})
    })
  },
  sendSmsValidCode(fun){
    let that=this;

    if(that.data.stamp){
        util.postByBeanName("wxUserTF","sendPasswordSmsValidCode", {billId:that.data.phone,programType:3},function(data){
            //成功执行
            if(data){
              that.setData({
                stamp:false,
                miao:60,
              })
              if(typeof fun == "function"){
                fun();
              }
              var timer = setInterval(function(){
                var miao = that.data.miao;
                var msg = that.data.msg;
                var stamp = that.data.stamp
                if(!stamp){
                  miao = parseInt(miao) - 1;
                  msg = miao+"S";
                  if(miao == 0){
                      msg="获取验证码";
                      stamp=true;
                      clearInterval(timer)
                  }
                }else{
                    msg="获取验证码";
                    stamp=true;
                }
                that.setData({
                  stamp,
                  miao,
                  msg
                })
              }, 1000);
            }
        },function(data){
          if(data.data.message==='短信验证码5分钟内有效，无需重复申请'){
            that.setData({verifyPhone:false})
          }
        })
    }
  },
  reback(){
    wx.navigateBack();
  }

})
