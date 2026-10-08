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
    await this.doQuery(id);
    this.initScroll();
  },
  async doQuery(id){
    let info = await util.postByBeanName('ordWaybillTF','getOrdWaybillVehicleCheckInfo',{id});
    info.checkList.forEach((item,index) => {
      item.content = `<strong>*${index+1}.${item.itemName}：</strong>${item.requirements}`
    })
    this.setData({info})
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
        constractTop:res[1].top - 50,
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
  /**
   * 查看大图
   */
  seeBigImg(e){
    let current = e.currentTarget.dataset.url;
    let urls = [];
    this.data.info.fileList.forEach((item) => {
      urls.push(item.fileUrl);
    })
    wx.previewImage({
      current,
      urls, // 需要预览的图片http链接列表
    })
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
    let {remark} = this.data;
    let {id} = this.data.info;
    await util.postByBeanName('ordWaybillTF','confirmOrdWaybillVehicleCheck',{id,type:2,confirmRemark:remark});
    await wxApi.showModal("操作成功。");
    this.back();
  },
  // 审核通过
  async audit(e){
    let {confirm} = await wxApi.showModal({
      title:"提示",
      content:"您正在操作车辆点检，是否继续？",
      showCancel:true
    })
    if(confirm){
      let {id} = this.data.info;
      await util.postByBeanName('ordWaybillTF','confirmOrdWaybillVehicleCheck',{id,type:1});
      wxApi.showModal("操作成功。")
      this.back();
    }
  },
  back(){
    wx.navigateBack({
      delta: 1,
    })
  },
})