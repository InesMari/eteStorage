import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showFinish:false,
    info:{},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad({id}) {
    let info = await util.postByBeanName('purPurchaseOrderDeliveryService','loadPurPurchaseOrderDeliveryById',{id});
    console.log(info)
    //交货单
    if(common.isNotBlank(info.info.url)){
      this.setData({file:info.info.url});
    }
    // 实物图
    if(common.isNotBlank(info.info.realUrl)){
      this.setData({realFile:info.info.realUrl});
    }
    this.setData({info:info.info,dtlList:info.dtlList,userList:info.userList});
  },
})