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
    this.setData({entitys:common.getEntityIds()});
    common.checkAppointToken();
    let info = await util.postByBeanName('fcPayTF','loadFcPayInfoForPrintById',{id});
    info.payType = String(info.payType); 
    // 拼接报销内容
    info.projectList.forEach((item,index) => {
      item.payContent = item.payProjectName+(item.payRemark?',':'')+item.payRemark+(item.payFee?',￥':'')+item.payFee;
    })
    let {APPLY_PAY_TYPE} = await util.postByBeanName('commonTF','getSysStaticDataByCodeTypes',{codeType:"APPLY_PAY_TYPE"});
    APPLY_PAY_TYPE.forEach(el => {
      el.codeId = String(el.codeId);
    })
    this.setData({info,applyPayType:APPLY_PAY_TYPE});
  },
  // 备注
  inputSetRemark(e){
    let {value} = e.detail;
    this.setData({remark:value})
  },
  sureAlert(){
    this.unAudit();
  },
  cancelAlert(){
    this.setData({
      showUnPassAlert:false,
    })
  },
  // 审核不通过备注弹窗
  showUnPassAlertMethod(){
    this.setData({
      showUnPassAlert:true,
    })
  },
  // 审核不通过
  async unAudit(e){
    let type = 2;
    let {remark} = this.data;
    if(common.isBlank(remark)){
      wxApi.showToast("请填写不通过原因。");
      return;
    }
    let {id} = this.data.info;
    await util.postByBeanName('fcPayTF','applyFcPayInfo',{id,type,applyRemark:remark});
    this.cancelAlert();
    await wxApi.showModal("操作成功。");
    this.back();
  },
  // 审核通过
  async audit(e){
    let type = 1;
    let {confirm} = await wxApi.showModal({
      title:"提示",
      content:"您正在操作审核确认，是否继续？",
      showCancel:true
    })
    if(confirm){
      let {id} = this.data.info;
      await util.postByBeanName('fcPayTF','applyFcPayInfo',{id,type});
      this.setData({showFinish:true})
    }
  },
  // 取消
  async delPayOrder(){
    let {confirm} = await wxApi.showModal({
      title:"提示",
      content:"您正在操作取消，是否继续？",
      showCancel:true
    })
    if(confirm){
      await util.postByBeanName('fcPayTF','delFcPayInfo',this.data.info);
      wxApi.showModal("取消成功！")
      this.back();
    }
  },
  // 取消审核
  async cancelPayOrder(){
    let {confirm} = await wxApi.showModal({
      title:"提示",
      content:"您正在操作取消审核，是否继续？",
      showCancel:true
    })
    if(confirm){
      await util.postByBeanName('fcPayTF','cancelFcPayInfo',this.data.info);
      wxApi.showModal("取消审核成功！")
      this.back();
    }
  },
  back(){
    let pageLength = getCurrentPages().length;
    if(pageLength>1){
      wx.navigateBack({
        delta:1
      })
    }else{
      wx.redirectTo({
        url: '/receipts/paymentManager/paymentManager',
      })
    }
  },
  // 查看采购申请单号详情
  toDetail(e){
    let {id} = e.currentTarget.dataset;
    if(this.data.info.feeApplySrc == 2){
      wx.navigateTo({
        url: '/purchase/feeInventory/feeInventory?id='+id,
      })
    }else{
      wx.navigateTo({
        url: '/assets/purchaseApplyDetail/purchaseApplyDetail?id='+id,
      })
    }
  }
})