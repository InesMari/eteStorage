import {util,wxApi,common,regeneratorRuntime} from '../../../common/commonImport'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    info:{
      searchKey:"",
    },
    isRefresh:false,
    showCodeDialog:false,
    currentItem:{},
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
    let {items,hasNext} = await util.postByBeanName('ordPlanTF','queryOrdPlanData',{...info,page}); 
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
  // 查看详情
  toDetail(e){
    let {id} = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: '../orderPlanDetail/orderPlanDetail?id='+id,
    })
  },
  // 新增订单包
  addOrderPlan(){
    wx.navigateTo({
      url: `../addOrderPlan/addOrderPlan`,
    })
  },
  // 查看小程序码
  async visitCode(e){
    let {item} = e.currentTarget.dataset;
    if(!item.qrcodeFileUrl){
      wx.showToast({
        title: '暂无小程序码',
        icon: 'none'
      });
      return;
    }
    this.setData({
      currentItem: item,
      showCodeDialog: true
    });
    // 获取订单包详细信息
    try {
      let data = await util.postByBeanName('ordPlanTF','loadPlanInfoByPlanId',{planId:item.id});
      this.setData({
        'currentItem.orderTypeName': data.orderPlan.orderTypeName,
        'currentItem.workData': data.workData
      });
    } catch(err) {
      console.error('获取订单包信息失败:', err);
    }
  },
  // 关闭弹窗
  closeCodeDialog(){
    this.setData({
      showCodeDialog: false
    });
  },
})