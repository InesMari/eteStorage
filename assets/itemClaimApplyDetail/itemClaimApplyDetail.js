import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showFinish:false,
    showAlert:false,
    info:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad({id}) {
    this.setData({entitys:common.getEntityIds()});
    common.checkAppointToken();
    let info = await util.postByBeanName('claimApplyServiceImpl','loadClaimApplyById',{id});
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
    let type = this.data.currentType;
    if(type == 1){
      this.audit();
    }else{
      if(common.isBlank(this.data.remark)){
        wxApi.showToast("请填写审批意见。");
        return;
      }
      this.unAudit();
    }
    this.cancelAlert();
  },
  cancelAlert(){
    this.setData({
      showAlert:false,
    })
  },
  // 审核意见弹窗
  showAlertMethod(e){
    let {type} = e.currentTarget.dataset;
    this.setData({
      showAlert:true,
      currentType:type
    })
  },
  // 审核不通过
  async unAudit(e){
    let {remark} = this.data;
    let {id} = this.data.info;
    await util.postByBeanName('claimApplyServiceImpl','verifyClaimApplyById',{id,type:3,verifyRemark:remark});
    await wxApi.showModal("操作成功。");
    this.back();
  },
  // 审核通过
  async audit(e){
    let {remark} = this.data;
    let {id} = this.data.info;
    await util.postByBeanName('claimApplyServiceImpl','verifyClaimApplyById',{id,type:1,verifyRemark:remark});
    this.setData({showFinish:true})
  },
  back(){
    wx.redirectTo({
      url: '/assets/itemClaimApplyManage/itemClaimApplyManage',
    })
  }
})