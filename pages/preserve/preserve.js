import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  onLoad: function (res) {
  },
    /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    common.checkAppointToken();
    let userInfo = wx.getStorageSync('userInfo');
    if(common.isBlank(userInfo)){
      wx.reLaunch({
        url: '/pages/guideIndex/guideIndex',
      })
      return false;
    }
    wx.login({
      success: res => {
         //后台处理登录相关
        util.postByBeanName("wxUserTF", "checkLogin", {
          wxCode: res.code,
          programType:3
        },
        function (data) {
          if(data=='Y'){
            //登录成功
            wx.reLaunch({
              url: '/pages/index/index?chooseOrg=1',
            })
          }else{
            wx.reLaunch({
              url: '/pages/guideIndex/guideIndex',
            })
          }
        },
        function (data) {
          wx.reLaunch({
            url: '/pages/guideIndex/guideIndex',
          })
        });
      }
    })
  },
})