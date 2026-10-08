import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function ({info,waybillId}) {
    let list = JSON.parse(decodeURI(info));
    this.setData({list,waybillId});
  },
  numIpt(e){
    let {value} = e.detail;
    let {item,index} = e.currentTarget.dataset;
    item.workOrder = value;
    this.setData({['list['+index+']']:item});
  },
  async submit(){
    await util.postByBeanName('miniProgramWaybillTF','adjustmentWorkOrder',{waybillId:this.data.waybillId,workList:this.data.list}); 
    await wxApi.showModal("修改成功")
    wx.navigateBack({
      delta: 1,
    })
  },
})