import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    active:0,
    info:{
      keyword:"",
      sts:"",
      operation:1
    },
    isRefresh:false,
  },

  onShow() {
    this.doQuery(true);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad({operation}) {
    if(operation==2){
      wx.setNavigationBarTitle({
        title: '出库核查管理',
      })
    }
    this.setData({['info.operation']:operation});
    this.doQuery(true);
  },
  async doQuery(clear){
    if (clear) {  //clear为true的时候清空页码
      this.setData({ page: 1 });
    }
    let {info,page} = this.data;
    let {items,hasNext} = await util.postByBeanName('wmsExamineTF','queryWmsOrderExaminePage',{...info,page}); 
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
    let sts = e.detail.name;
    switch(sts){
      case 0:this.setData({['info.sts']:""}); break;   //全部
      case 1:this.setData({['info.sts']:0}); break;    //待检查
      case 2:this.setData({['info.sts']:1}); break;    //检查中
      case 3:this.setData({['info.sts']:2}); break;    //已完成
    }
    this.doQuery(true);
  },
  // 查看详情 
  toDetail(e){
    let {item} = e.currentTarget.dataset;
    wx.navigateTo({
      url: `../verificationDetail/verificationDetail?id=${item.id}&operation=${this.data.info.operation}`,
    })
  },
})