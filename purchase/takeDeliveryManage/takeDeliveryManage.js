import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    active:0,
    info:{
      searchKey:"",
      confirmState:'',
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
    let {items,hasNext} = await util.postByBeanName('purPurchaseOrderDeliveryService','queryPurInStockPageForWechat',{...info,page}); 
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
    let confirmState = e.detail.name;
    switch(confirmState){
      case 0:this.setData({['info.confirmState']:''}); break;    //全部
      case 1:this.setData({['info.confirmState']:0}); break;    //未确认
      case 2:this.setData({['info.confirmState']:1}); break;    //已确认
    }
    this.doQuery(true);
  },
  // 查看详情
  toDetail(e){
    let {id} = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: '../takeDeliveryDetail/takeDeliveryDetail?id='+id,
    })
  },
  // 收货入库
  takeDelivery(){
    wx.navigateTo({
      url: '../takeDelivery/takeDelivery',
    })
  },
})