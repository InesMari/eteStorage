import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'
/**
  * 状态 WAYBILL_STATE 
0 待派车：未调度车辆
1 待出车：已调度车辆
2 运输中：司机小程序点击出车操作；中转跟踪节点
3 已完成：司机小程序点击收车操作；手工完成；
4 已取消：运单未派车状态下取消运单
5 异常中止：运单已派车、运作中状态下取消运单

小程序运输管理
miniProgramWaybillTF
queryWaybillListPage

小程序查看运单详情
queryWaybillInfoByWaybillId

货物清单列表
loadWaybillGoodsListByWaybillId

调整作业点顺序
adjustmentWorkOrder

dispatchCar 派车(waybillId,driverUserId,vehicleId)
queryVehicleList  车辆(plateNumber/isInvoice)
queryDriverList   司机(driverName/isInvoice)
*/
Page({

  /**
   * 页面的初始数据
   */
  data: {
    active:1,
    info:{
      searchStr:"",
      waybillState:0,
    },
    isRefresh:false,
  },

  /**
   * 生命周期函数--监听页面加载
   * type  3是整车，4是调度（后续改动了不分整车零担，都是查全部。）
   */
  onLoad({type}) {
    this.setData({['info.dispatchType']:type});
    if(type==1){
      wx.setNavigationBarTitle({
        title: '订单调度' 
      })
    }else if(type==4){
      wx.setNavigationBarTitle({
        title: '零担调度' 
      })
    }
    this.doQuery(true);
  },
  onShow(){
    if(this.data.info.dispatchType){
      this.doQuery(true);
    }
  },
  async doQuery(clear){
    if (clear) {  //clear为true的时候清空页码
      this.setData({ page: 1 });
    }
    let {info,page} = this.data;
    console.log(info);
    let {items,hasNext} = await util.postByBeanName('ordWaybillTF','queryDispatchOrdPage',{...info,page}); 
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
    this.setData({['info.searchStr']:e.detail})
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
      case 0:this.setData({['info.waybillState']:""}); break;   //全部
      case 1:this.setData({['info.waybillState']:0}); break;    //待派车
      case 2:this.setData({['info.waybillState']:1}); break;    //待出车
      case 3:this.setData({['info.waybillState']:2}); break;    //运作中
      case 4:this.setData({['info.waybillState']:3}); break;    //已完成
      case 5:this.setData({['info.waybillState']:4}); break;    //异常终止
    }
    this.doQuery(true);
  },
  // 查看详情
  toDetail(e){
    let {item} = e.currentTarget.dataset;
    let info = encodeURI(JSON.stringify(item));
    wx.navigateTo({
      url: '../waybill/waybill?info='+info,
    })
  },
  // 派车
  toDispatch(e){
    // let {isInvoice,driverUserId,vehicleId,waybillId} = e.currentTarget.dataset.item;
    let type = this.data.info.dispatchType;
    let {item} = e.currentTarget.dataset;
    item.dispatchType = type;
    let info = encodeURI(JSON.stringify(item));
    if(type==1){  //订单
      wx.navigateTo({
        url: `../dispatch/dispatch?info=${info}`,
      })
    }else if(type==4){
      wx.navigateTo({ //零担
        url: `../ldDispatch/ldDispatch?info=${info}`,
      })
    }
  }
})