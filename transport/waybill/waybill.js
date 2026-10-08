import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info:{},
    goodsList:null,             //货物清单数组
    isshowGoodsDetail:false,  //是否展示货物清单
    isshowFeeDetail:false,    //是否展示货物明细
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad({info,waybillId}) {
    this.setData({entitys:common.getEntityIds()});
    if(info){ //派车
      info = JSON.parse(decodeURI(info));
      let {isInvoice,driverUserId,vehicleId,waybillId,waybillState,dispatchType} = info;
      let res = await util.postByBeanName('miniProgramWaybillTF','queryWaybillInfoByWaybillId',{waybillId}); 
      this.setData({info:res,waybillId,driverUserId,vehicleId,isInvoice,waybillState,dispatchType})
    }else if(waybillId){  //查看详情
      let res = await util.postByBeanName('miniProgramWaybillTF','queryWaybillInfoByWaybillId',{waybillId}); 
      this.setData({info:res,waybillId})
    }
  },
  /**
   * 查看货物详情
   */
  async showGoodsDetail(){
    if(common.isBlank(this.data.goodsList)){
      var goodsList = await util.postByBeanName('miniProgramWaybillTF','loadWaybillGoodsListByWaybillId',{waybillId:this.data.waybillId}); 
    }
    let isshowGoodsDetail = this.data.isshowGoodsDetail?false:true;
    this.setData({isshowGoodsDetail,goodsList});
  },
  /**
   * 查看费用详情
   */
  showFeeDetail(){
    let isshowFeeDetail = this.data.isshowFeeDetail?false:true;
    this.setData({isshowFeeDetail});
  },
  /**
   * 致电客服
   */
  callService(){
    wxApi.showToast("暂无客服电话")
    // wx.makePhoneCall({
    //   phoneNumber
    // })
  },
  /**
   * 致电司机 
   */
  callDriver(){
    let phoneNumber = this.data.info.distribution.linkPhone;
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