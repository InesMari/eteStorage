import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    active:0,
    info:{
      keyword:"",
      state:'',
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
    let {items,hasNext} = await util.postByBeanName('exceptionTF','queryExceptionInfoPage',{...info,page}); 
    let {userId} = wx.getStorageSync('userInfo');
    items.forEach(el => {
      if(el.createUserId == userId){
        el.isMyExc = true;
      }
    })
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
    this.setData({['info.keyword']:e.detail})
    //延迟查询
    if (this.data.searchTimeout) clearTimeout(this.data.searchTimeout);
    this.data.searchTimeout = setTimeout(() => {
      this.doQuery(true)
      clearTimeout(this.data.searchTimeout);
    }, 300)
  },
  onChange(e){
    let state = e.detail.name;
    switch(state){
      case 0:this.setData({['info.state']:''}); break;    //全部
      case 1:this.setData({['info.state']:0}); break;    //待处理
      case 2:this.setData({['info.state']:1}); break;   //处理中
      case 3:this.setData({['info.state']:2}); break;    //待审核
      case 4:this.setData({['info.state']:3}); break;    //审核中
      case 5:this.setData({['info.state']:4}); break;    //已审核
      case 6:this.setData({['info.state']:9}); break;    //审核不通过
    }
    this.doQuery(true);
  },
  // 查看详情
  toDetail(e){
    let {id} = e.currentTarget.dataset;
    wx.navigateTo({ 
      url: '../exceptDetail/exceptDetail?id='+id,
    })
  },
  toExam(e){
    let {id} = e.currentTarget.dataset;
    wx.navigateTo({ 
      url: '../exceptDetail/exceptDetail?id='+id,
    })

  },
  // 备注
  inputSetRemark(e){
    let {value} = e.detail;
    this.setData({verifyRemark:value})
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
  showUnPassAlertMethod(e){
    let {id} = e.currentTarget.dataset;
    this.setData({
      showUnPassAlert:true,
      currentId:id,
    })
  },
  // 审核不通过
  async unAudit(e){
    let {verifyRemark} = this.data;
    let id = this.data.currentId;
    await util.postByBeanName('exceptionTF','verifyExceptionInfo',{id,type:2,verifyRemark});
    await wxApi.showModal("操作成功。");
    this.doQuery(true);
  },
  // 审核通过
  async audit(e){
    let {confirm} = await wxApi.showModal({
      title:"提示",
      content:"您正在操作审核确认，是否继续？",
      showCancel:true
    })
    if(confirm){
      let {id} = e.currentTarget.dataset;
      await util.postByBeanName('exceptionTF','verifyExceptionInfo',{id,type:1});
      this.doQuery(true);
    }
  },
  // 处理异常
  toHandel(e){
    let {id} = e.currentTarget.dataset;
    wx.navigateTo({
      url: '../exceptHandle/exceptHandle?id='+id,
    })
  }
})