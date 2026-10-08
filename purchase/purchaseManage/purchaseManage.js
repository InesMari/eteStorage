import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    active:0,
    info:{
      searchKey:"",
      verifyState:10,
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
    let {items,hasNext} = await util.postByBeanName('purPurchaseService','queryPurPurchasePageForWechat',{...info,page}); 
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
      case 0:this.setData({['info.verifyState']:10}); break;    //待我处理
      case 1:this.setData({['info.verifyState']:''}); break;    //全部
      case 2:this.setData({['info.verifyState']:0}); break;    //未审核
      case 3:this.setData({['info.verifyState']:1}); break;    //审核中
      case 4:this.setData({['info.verifyState']:2}); break;    //审核不通过
      case 5:this.setData({['info.verifyState']:3}); break;    //审核完
    }
    this.doQuery(true);
  },
  // 查看详情
  toDetail(e){
    let {id} = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: '../purchaseDetail/purchaseDetail?id='+id,
    })
  },
})