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
    this.setData({
      offLineList:offLineList.items,
    })
  },
  toDetail(e){
    let {vehicleId} = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: `../../vehicleMap/vehicleMap?vehicleId=${vehicleId}`,
    })
  },
})