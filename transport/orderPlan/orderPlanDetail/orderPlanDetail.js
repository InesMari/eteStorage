import {util,wxApi,common,regeneratorRuntime} from '../../../common/commonImport'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info:{},
    isshowGoodsDetail:false,  //是否展示货物清单
    isshowIncomeDetail:false,    //单趟收入计费明细
    isshowCostDetail:false,   //单趟成本计费明细
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad({id}) {
    let res = await util.postByBeanName('ordPlanTF','loadPlanInfoByPlanId',{planId:id}); 
    this.setData({info:res})
  },
  /**
   * 查看货物详情
   */
  async showGoodsDetail(){
    let isshowGoodsDetail = this.data.isshowGoodsDetail?false:true;
    this.setData({isshowGoodsDetail});
  },
  /**
   * 查看单趟收入计费明细详情
   */
  showIncomeDetail(){
    let isshowIncomeDetail = this.data.isshowIncomeDetail?false:true;
    this.setData({isshowIncomeDetail});
  },
  /**
   * 查看单趟成本计费明细详情
   */
  showCostDetail(){
    let isshowCostDetail = this.data.isshowCostDetail?false:true;
    this.setData({isshowCostDetail});
  },
  /**
   * 致电客服
   */
  callService(){
    let phoneNumber = this.data.info.distribution.phone;
    if(common.isBlank(phoneNumber)){
        wxApi.showToast("暂无客服电话")
    }
    wx.makePhoneCall({
      phoneNumber
    })
  },
  /**
   * 致电司机 
   */
  callDriver(){
    let phoneNumber = this.data.info.distribution.bill;
    if(common.isBlank(phoneNumber)){
        wxApi.showToast("司机未预留电话")
    }
    wx.makePhoneCall({
      phoneNumber
    })
  },
  /**
   * 线路详情
   */
  toWayDetail(e){
    let {item} = e.currentTarget.dataset;
    let info = encodeURI(JSON.stringify(item));
    wx.navigateTo({
      url: '../wayDetail/wayDetail?info='+info,
    })
  },
  /**
   * 调整作业点顺序
   */
  toWaySort(e){
    let {item} = e.currentTarget.dataset;
    let info = encodeURI(JSON.stringify(item));
    wx.navigateTo({
      url: `../waySort/waySort?info=${info}&waybillId=${this.data.waybillId}`,
    })
  },
  /**
   * 查看大图
   */
  seeBigImg(e){
    wx.previewImage({
      urls: [e.currentTarget.dataset.url] // 需要预览的图片http链接列表
    })
  },
  
  // 派车
  toDispatch(){
    let {isInvoice,driverUserId,vehicleId,waybillId,waybillState} = this.data;
    let {routeName,waybillNum} = this.data.info;
    let info = encodeURI(JSON.stringify({isInvoice,driverUserId,vehicleId,waybillId,waybillState,routeName,waybillNum}));
    let type = this.data.dispatchType;
    if(type==1 || type==3){  //整车
      wx.navigateTo({
        url: `../dispatchCar/dispatchCar?info=${info}`,
      })
    }else if(type==4){
      wx.navigateTo({ //零担
        url: `../ldDispatchCar/ldDispatchCar?info=${info}`,
      })
    }
  }
})