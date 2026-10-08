import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showFinish:false,
    showUnPassAlert:false,
    info:{},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad({id}) {
    let info = await util.postByBeanName('purPurchaseService','loadPurPurchaseById',{id});
    this.setData({info:info.info,fileList:info.fileList,dtlList:info.dtlList,userList:info.userList});
  },
  // 备注
  inputSetRemark(e){
    let {value} = e.detail;
    this.setData({remark:value})
  },
  async sureAlert(){
    let type = this.data.currentType;
    if(type == 2 && common.isBlank(this.data.remark)){
      wxApi.showToast("请填写审核意见。");
      return;
    }
    let {remark} = this.data;
    let {id} = this.data.info;
    await util.postByBeanName('purPurchaseService','verifyPurPurchase',{id,type,verifyRemark:remark});
    this.cancelAlert();
    await wxApi.showModal("操作成功。");
    this.back();
  },
  cancelAlert(){
    this.setData({
      showAlert:false,
    })
  },
  // 审核弹窗
  showAlertMethod(e){
    let {type} = e.currentTarget.dataset;
    this.setData({
      showAlert:true,
      currentType:type
    })
  },
  back(){
    let pageLength = getCurrentPages().length;
    if(pageLength>1){
      wx.navigateBack({
        delta:1
      })
    }else{
      wx.redirectTo({
        url: '/purchase/purchaseManage/purchaseManage',
      })
    }
  },
})