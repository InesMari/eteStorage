import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderIdList:[],
    orderWorkDataList:[],
    info:{
      receiptsType:'2',
      imgData:[]
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad({info}) {
    let {waybillId,routeName,waybillNum,waybillState} = JSON.parse(decodeURI(info));
    let newInfo = {waybillId,routeName,waybillNum,waybillState}
    let orderIdList = await util.postByBeanName('pkgBusinessTF','queryAllOrderByWaybillId',{waybillId});
    this.setData({orderIdList,info:{...this.data.info,...newInfo}});
  },

  
  // 选择订单
  orderIdChange(e){
    let { value } = e.detail;
    this.setData({
      ["info.orderId"]: this.data.orderIdList[value].orderId,
      ["info.orderNum"]: this.data.orderIdList[value].orderNum,
      ["info.tenantName"]: this.data.orderIdList[value].tenantName,
      "orderIdIndex":value,
    })
    this.queryOrderWorkDataSelect();
  },
  //查询订单作业点
  async queryOrderWorkDataSelect(){
    let orderWorkDataList = await util.postByBeanName('pkgBusinessTF','queryAllDischargeByOrderId',{orderId:this.data.info.orderId}); 
    this.setData({orderWorkDataList})
  },
  // 选择订单作业点
  orderWorkDataChange(e){
    let { value } = e.detail;
    this.setData({
      ["info.waybillWorkId"]: this.data.orderWorkDataList[value].workId,
      ["info.workAddressStr"]: this.data.orderWorkDataList[value].workAddressStr,
      "orderWorkDataIndex": value
    })
  },
  // 选择单据类型
  receiptsTypeChange(e){
    this.setData({
      ['info.receiptsType']:e.detail
    })
  },
  // 上传照片
  async afterRead(event) {
    wx.showLoading();
    const { file } = event.detail;
    let {id} = event.currentTarget.dataset;
    let {data} = await util.uploadFile(file);
    wx.hideLoading();
    data = JSON.parse(data);  //数据转化
    let obj = {};
    obj.url = data.content.fullPath;
    obj.imgId = data.content.flowId;
    obj.imgPath = data.content.storePath;
    obj.fullPath = data.content.fullPath;
    obj.fileName = data.content.fileName;
    this.data.info.imgData.push(obj);
    this.setData({['info.imgData']:this.data.info.imgData});
  },
  // 删除照片
  deleteImg(event){
    let index = event.detail.index;
    this.data.info.imgData.splice(index,1);
    this.setData({['info.imgData']:this.data.info.imgData});
  },
  // 保存
  async submit(){
    await util.postByBeanName('receiptsTF','insertReceipts',this.data.info);
    await wxApi.showModal("上传成功");
    wx.navigateBack({
      delta: 1,
    })
  }
})