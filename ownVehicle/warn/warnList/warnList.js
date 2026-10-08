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
  onLoad() {
    this.doQuery();
  },
  async doQuery(){
    let offLineList = await util.postByBeanName('vehicleBenefitAccountingService', 'queryOwnVehicleOfflinePage');
    let fatigueDriving = await util.postByBeanName('vehicleBenefitAccountingService', 'queryOwnVehicleFatigueDrivingPage');
    this.setData({
      offLine:offLineList.items[0],
      offLineTotal:offLineList.totalNum,
      fatigueDriving:fatigueDriving.items[0],
      fatigueDrivingTotal:fatigueDriving.totalNum,
    })
  },
  // 离线
  toOffLine(){
    wx.navigateTo({
      url: `../offLine/offLine`,
    })
  },
  // 疲劳驾驶
  toFatigueDriving(){
    wx.navigateTo({
      url: `../fatigueDriving/fatigueDriving`,
    })
  },
})