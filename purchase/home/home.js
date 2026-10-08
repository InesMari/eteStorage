import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
    counts:{},
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
  goback(){
    wx.redirectTo({
      url: '/pages/index/index',
    })
  },
  async loadTodoData(){
    let counts = await util.postByBeanName('wxUserTF','loadTodoData');
    this.setData({counts})
  },
  // 费用申请
  toFeeApply(){
    wx.navigateTo({
      url: '/purchase/feeApply/feeApply',
    })
  },
  toPurchaseManage(){
    wx.navigateTo({
      url: '/purchase/purchaseManage/purchaseManage',
    })
  },
  // 收货入库
  toTakeDeliveryManage(){
    wx.navigateTo({
      url: '/purchase/takeDeliveryManage/takeDeliveryManage',
    })
  },
  // 领用确认
  toReceiveManage(){
    wx.navigateTo({
      url: '/purchase/receiveManage/receiveManage',
    })
  },
  // 库存列表
  toInventoryManage(){
    wx.navigateTo({
      url: '/purchase/inventoryManage/inventoryManage',
    })
  }
})
