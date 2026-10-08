import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
    organizationAlert:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({entitys:common.getEntityIds()});
    wx.hideHomeButton();
    let userInfo = wx.getStorageSync('userInfo');
    let currentOrg = {id:userInfo.orgId,orgName:userInfo.orgName};
    this.setData({userInfo,currentOrg});
  },
  // 新增订单
  toAddOrder(){
    wx.navigateTo({
      url: '../addOrder/addOrder',
    })
  },
  // 订单包管理
  toOrderPlan(){
    wx.navigateTo({
      url: '../orderPlan/orderPlanManage/orderPlanManage',
    })
  },
  // 派车单管理
  toWaybillManage(){
    wx.navigateTo({
      url: '../waybillManage/waybillManage',
    })
  },
  // 标签扫码查询
  doScan(){
    wx.scanCode({
      onlyFromCamera: true,
      success: (res) => {
        console.log('扫码成功:', res);
        const waybillId = res.result;
        wx.navigateTo({
          url: `../waybill/waybill?waybillId=${waybillId}`,
        });
      },
      fail: (err) => {
        console.error('扫码失败:', err);
        wx.showToast({
          title: '扫码失败，请重试',
          icon: 'none'
        });
      }
    });
  },
  // 调度管理
  toTransportManage(e){
    let {type} = e.currentTarget.dataset;
    wx.navigateTo({
      url: '../transportManage/transportManage?type='+type,
    })
  },
  // 点检管理
  toVehicleCheck(){
    wx.navigateTo({
      url: `/transport/vehicleCheckManage/vehicleCheckManage`,
    })
  },
  // 自有车管理
  toOwnCar(){
    wx.navigateTo({
      url: `/transport/ownCar/ownCar`,
    })
  },
  goback(){
    wx.redirectTo({
      url: '/pages/index/index',
    })
  },
})