import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showFinish:false,
    showUnPassAlert:false,
    info:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad({id}) {
    this.setData({entitys:common.getEntityIds()});
    common.checkAppointToken();
    let info = await util.postByBeanName('assetsAllocatServiceImpl','loadAssetsAllocatById',{id});
    this.setData({info});
    // let {APPLY_PAY_TYPE} = await util.postByBeanName('commonTF','getSysStaticDataByCodeTypes',{codeType:"APPLY_PAY_TYPE"});
    // APPLY_PAY_TYPE.forEach(el => {
    //   el.codeId = String(el.codeId);
    // })
    // this.setData({info,applyPayType:APPLY_PAY_TYPE});
  },
  // 备注
  inputSetRemark(e){
    let {value} = e.detail;
    this.setData({remark:value})
  },
  sureAlert(){
    this.unAudit();
    this.cancelAlert();
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
    let type = 3;
    let {remark} = this.data;
    let {id} = this.data.info;
    await util.postByBeanName('assetsAllocatServiceImpl','verifyAssetsAllocatById',{id,type,verifyRemark:remark});
    await wxApi.showModal("操作成功。");
    this.back();
  },
  // 审核通过
  async audit(e){
    let {type} = e.currentTarget.dataset;
    let {confirm} = await wxApi.showModal({
      title:"提示",
      content:"您正在操作审核确认，是否继续？",
      showCancel:true
    })
    if(confirm){
      let {id} = this.data.info;
      await util.postByBeanName('assetsAllocatServiceImpl','verifyAssetsAllocatById',{id,type});
      this.setData({showFinish:true})
    }
  },
  back(){
    wx.redirectTo({
      url: '/assets/itemClaimApplyManage/itemClaimApplyManage',
    })
  }
})