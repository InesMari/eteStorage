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
    let info = await util.postByBeanName('purStockService','loadPurConsumingById',{id});
    this.setData({info:info.info});

    if(common.isBlank(info.info.url)) return;
    let fileList = [{fileUrl:info.info.url}];
    this.setData({fileList})
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
    await util.postByBeanName('purStockService','verifyConsuming',{id,type,verifyRemark:remark});
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
    wx.redirectTo({
      url: '/purchase/receiveManage/receiveManage',
    })
  },
})