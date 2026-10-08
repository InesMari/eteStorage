import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    active:0,
    showFinish:false,
    showAlert:false,
    info:{},
    inBase:true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad({id}) {
    this.setData({entitys:common.getEntityIds()});
    common.checkAppointToken();
    this.initScroll();
    let info = await util.postByBeanName('contractReviewTF','getContractReviewInfoForWechat',{id});
    info.taxRate = info.taxRate.split(',').map(String);  //类型转换
    info.storeHouseFireGrade = Number(info.storeHouseFireGrade);

    let {CERTIFICATE,HAVE_OR_NOT,CONTRACT_PAY_MODE,CONTRACT_INVOICE_TYPE,TAX_RATE,ACCOUNT_PERIOD,INSURANCE_CONTENT,PAY_CONDITION,STORE_HOUSE_FIRE_GRADE} = await util.postByBeanName('commonTF','getSysStaticDataByCodeTypes',{codeType:"CERTIFICATE,HAVE_OR_NOT,CONTRACT_PAY_MODE,CONTRACT_INVOICE_TYPE,TAX_RATE,ACCOUNT_PERIOD,INSURANCE_CONTENT,PAY_CONDITION,STORE_HOUSE_FIRE_GRADE"});
    this.arrayTypeChange(HAVE_OR_NOT,CONTRACT_PAY_MODE,CONTRACT_INVOICE_TYPE,TAX_RATE,ACCOUNT_PERIOD,INSURANCE_CONTENT,PAY_CONDITION,STORE_HOUSE_FIRE_GRADE)
    this.setData({
      info,
      certificate:CERTIFICATE,
      haveOrNot:HAVE_OR_NOT,
      contractPayMode:CONTRACT_PAY_MODE,
      contractInvoiceType:CONTRACT_INVOICE_TYPE,
      taxRate:TAX_RATE,
      accountPeriod:ACCOUNT_PERIOD,
      contractContentData:INSURANCE_CONTENT,
      payConditionData:PAY_CONDITION,
      storeHouseFireGradeData:STORE_HOUSE_FIRE_GRADE
    });
  },
  onPageScroll(e){
    if(e.scrollTop<this.data.constractTop){
      if(!this.data.inBase){
        this.setData({inBase:true,active:0});
      }
    }else{
      if(this.data.inBase){
        this.setData({inBase:false,active:1});
      }
    }
  },
  // 滚动逻辑
  initScroll(){
    let query = wx.createSelectorQuery().in(this);
    query.select("#base").boundingClientRect();
    query.select("#constract").boundingClientRect();
    let _this = this;
    query.exec(function (res) { 
      _this.setData({
        baseTop:res[0].top + 130,
        constractTop:res[1].top,
      })
    });
  },
  // 滚动位置
  toScroll(e){
    let {index} = e.detail;
    if(index==0){
      var scrollTop = 0;
    }else if(index==1){
      var scrollTop = this.data.constractTop;
    }
    wx.pageScrollTo({
      scrollTop,
      duration: 300
    });  
  },
  // 数据类型转换
  arrayTypeChange(){
    Array.from(arguments).forEach(item=>{
      item.forEach(el=>{
        el.codeValue = Number(el.codeValue);
      })
    })
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
        wxApi.showToast("请填写评审意见。");
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
  // 评审弹窗
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
    await util.postByBeanName('contractReviewTF','reviewContractInfo',{id,type:2,reviewRemark:remark});
    await wxApi.showModal("操作成功。");
    this.back();
  },
  // 审核通过
  async audit(e){
    let {remark} = this.data;
    let {id} = this.data.info;
    await util.postByBeanName('contractReviewTF','reviewContractInfo',{id,type:1,reviewRemark:remark});
    this.setData({showFinish:true})
  },
  back(){
    let pages = getCurrentPages();
    if(pages.length==1){
      wx.redirectTo({
        url: '/contract/contractList/contractList',
      })
    }else{
      wx.navigateBack({
        delta: 1,
      })
    }
  },
})