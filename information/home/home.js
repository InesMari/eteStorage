import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
  },
  onShow(){
    this.loadTodoData();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({entitys:common.getEntityIds()});
    wx.hideHomeButton();
    let userInfo = wx.getStorageSync('userInfo');
    this.setData({userInfo});
    this.loadTodoData();
  },
  async loadTodoData(){
    let counts = await util.postByBeanName('wxUserTF','loadTodoData');
    this.setData({counts})
  },
  goback(){
    wx.redirectTo({
      url: '/pages/index/index',
    })
  },
  toVehicle(){
    wx.navigateTo({
      url: '/information/vehicleManage/vehicleManage',
    })
  },
  toDriver(){
    wx.navigateTo({
      url: '/information/driverManage/driverManage',
    })
  }
})