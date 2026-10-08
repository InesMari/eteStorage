import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    active:0,
    info:{
      searchKey:"",
      state:10,
      isPT:1,
      showUnPassAlert:false,
    },
    isRefresh:false,
  },

  onShow() {
    this.doQuery(true);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.setData({entitys:common.getEntityIds()});
    this.doQuery(true);
  },
  async doQuery(clear){
    if (clear) {  //clear为true的时候清空页码
      this.setData({ page: 1 });
    }
    let {info,page} = this.data;
    let {items,hasNext} = await util.postByBeanName('fcPayTF','queryFcPayInfoPage',{...info,page}); 
    if (clear) {  //clean为true的时候清空数组(请求后操作，避免出现阶段性页面空白)
      this.setData({ list: [] });
    }
    this.setData({ list: [...this.data.list, ...items], hasNext, isRefresh: false});
  },
  // 滚动加载
  scrolltolowerHandler(){
    if (this.data.hasNext) {
      this.setData({ page: ++this.data.page });
      this.doQuery()
    }
  },
  // 上拉刷新
  toupper(){
    this.setData({ isRefresh:true})
    this.doQuery(true);
  },
  search(e){
    this.setData({['info.searchKey']:e.detail})
    //延迟查询
    if (this.data.searchTimeout) clearTimeout(this.data.searchTimeout);
    this.data.searchTimeout = setTimeout(() => {
      this.doQuery(true)
      clearTimeout(this.data.searchTimeout);
    }, 300)
  },
  onChange(e){
    let waybillState = e.detail.name;
    switch(waybillState){
      case 0:this.setData({['info.state']:10}); break;    //待我处理
      case 1:this.setData({['info.state']:""}); break;   //全部
      case 2:this.setData({['info.state']:1}); break;    //未审核
      case 3:this.setData({['info.state']:2}); break;    //审核中
      case 4:this.setData({['info.state']:3}); break;    //审核完毕
      case 5:this.setData({['info.state']:4}); break;    //已完结
      case 6:this.setData({['info.state']:5}); break;    //已完结
      case 7:this.setData({['info.state']:9}); break;    //审核不通过
    }
    this.doQuery(true);
  },
  // 查看详情
  toDetail(e){
    let {id} = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: '../paymentDetail/paymentDetail?id='+id,
    })
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
  showUnPassAlertMethod(e){
    this.setData({currentId:e.currentTarget.dataset.id})
    this.setData({
      showUnPassAlert:true,
    })
  },
  // 审核不通过
  async unAudit(){
    let type = 2;
    let {remark} = this.data;
    if(common.isBlank(remark)){
      wxApi.showToast("请填写不通过原因。");
      return;
    }
    let id = this.data.currentId;
    await util.postByBeanName('fcPayTF','applyFcPayInfo',{id,type,applyRemark:remark});
    this.cancelAlert();
    await wxApi.showModal("操作成功。");
    this.doQuery(true);
  },
  // 审核通过
  async audit(e){
    let type = 1;
    let {id} = e.currentTarget.dataset;
    let {confirm} = await wxApi.showModal({
      title:"提示",
      content:"您正在操作审核确认，是否继续？",
      showCancel:true
    })
    if(confirm){
      await util.postByBeanName('fcPayTF','applyFcPayInfo',{id,type});
      this.doQuery(true);
    }
  },
  // 取消
  async delPayOrder(e){
    let {item} = e.currentTarget.dataset;
    let {confirm} = await wxApi.showModal({
      title:"提示",
      content:"您正在操作取消，是否继续？",
      showCancel:true
    })
    if(confirm){
      await util.postByBeanName('fcPayTF','delFcPayInfo',item);
      wxApi.showToast("取消成功！")
      this.doQuery(true);
    }
  },
  // 取消审核
  async cancelPayOrder(e){
    let {item} = e.currentTarget.dataset;
    let {confirm} = await wxApi.showModal({
      title:"提示",
      content:"您正在操作取消审核，是否继续？",
      showCancel:true
    })
    if(confirm){
      await util.postByBeanName('fcPayTF','cancelFcPayInfo',item);
      wxApi.showToast("取消审核成功！")
      this.doQuery(true);
    }
  },
})