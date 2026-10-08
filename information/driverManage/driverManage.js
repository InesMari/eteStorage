import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[],
    page:1,
    params:{},
    isRefresh:false,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function (options) {
    this.setData({entitys:common.getEntityIds()});
    this.doQuery(true);
  },
  /**
   * 
   * @param clear true:重新加载 ,false:加载下一页
   */
  async doQuery(clear){
    if (clear) {  //clean为true的时候清空数组和页码
      this.setData({ page: 1 });
    }
    let {items,hasNext} = await util.postByBeanName('driverTF','queryDriverInfoList',{...this.data.params,page:this.data.page});
    if (clear) {  //clean为true的时候清空数组
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
    this.setData({['params.driverName']:e.detail})
    //延迟查询
    if (this.data.searchTimeout) clearTimeout(this.data.searchTimeout);
    this.data.searchTimeout = setTimeout(() => {
      this.doQuery(true)
      clearTimeout(this.data.searchTimeout);
    }, 300)
  },
  // 启用禁用司机
  async updateState(e){
    let {id,sts,driverName} = e.currentTarget.dataset.item;
    let state = sts==0?1:0;
    await util.postByBeanName('driverTF','updateDriverState',{driverIds:id, state,driverName});
    if(sts == 0){
      await wxApi.showModal('启用成功');  
    }
    if(sts == 1){
      await wxApi.showModal('禁用成功');  
    }
    this.doQuery(true);
  },
  toAddDriver(){
    wx.navigateTo({
      url: '../addDriver/addDriver',
    })
  },
  toEdit(e){
    let {id} = e.currentTarget.dataset;
    wx.navigateTo({
      url: '../addDriver/addDriver?id='+id,
    })
  },
  toDetail(e){
    let {id,state} = e.currentTarget.dataset;
    if(state!=2 || common.isBlank(state)){
      wx.navigateTo({
        url: '../driverDetail/driverDetail?id='+id,
      })
    }else{
      wx.navigateTo({
        url: '../addDriver/addDriver?id='+id,
      })
    }
  },
})