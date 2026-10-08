import {util,wxApi,common,regeneratorRuntime} from '../../../common/commonImport'
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({entitys:common.getEntityIds()});
  },
  // 仓库来料异常登记
  toMaterialAbnormal(){
    wx.navigateTo({
      url: '/storage/inspectReg/materialAbnormal/materialAbnormal',
    })
  },
  // 仓库来料异常登记历史记录
  toMaterialAbnormalList(){
    wx.navigateTo({
      url: '/storage/inspectReg/materialAbnormalList/materialAbnormalList',
    })
  },
  // 仓库异常品登记
  toGoodsAbnormal(){
    wx.navigateTo({
      url: '/storage/inspectReg/goodsAbnormal/goodsAbnormal',
    })
  },
  // 仓库异常品登记历史记录
  toGoodsAbnormalList(){
    wx.navigateTo({
      url: '/storage/inspectReg/goodsAbnormalList/goodsAbnormalList',
    })
  },
})