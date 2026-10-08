import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad({id}) {
    this.setData({entitys:common.getEntityIds()});
    common.checkAppointToken();
    let info = await util.postByBeanName('purPayPlanTF','getPurPayPlanInfo',{id});
    this.setData({info});
  },
  // 采购单详情
  toPurchaseDetail(e){
    let {id} = e.currentTarget.dataset;
    wx.navigateTo({
      url: '/purchase/purchaseDetail/purchaseDetail?id='+id,
    })
  },
  // 费用申请单详情
  toApplyDetail(e){
    let {id} = e.currentTarget.dataset;    
    wx.navigateTo({
      url: '/purchase/feeApplyDetail/feeApplyDetail?id='+id,
    })
  }
})