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
    let fatigueDrivingList = await util.postByBeanName('vehicleBenefitAccountingService', 'queryOwnVehicleFatigueDrivingPage');
    this.setData({
      fatigueDrivingList:fatigueDrivingList.items,
    })
  },
})