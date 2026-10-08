import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info:{},
    currentItem:{},
    itemSts:1,
    disabledAllSure:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(query) {
    if(common.isBlank(query.scene)){
      var {id,operation} = query;
    }else{
      let scene = decodeURIComponent(query.scene);
      let arr = scene.split(",");
      var id = arr[0];
      var operation = arr[1];
    }
    if(operation==2){
      wx.setNavigationBarTitle({
        title: '出库单详情',
      })
    }
    this.setData({id,operation})
    this.doQuery();
  },
  async doQuery(){
    let {id,operation} = this.data;
    let res = await util.postByBeanName('wmsExamineTF','getOrderDetail',{id,operation}); 
    this.setData({info:res,operation})
  },
  /**
   * 查看大图
   */
  seeBigImg(e){
    wx.previewImage({
      urls: [e.currentTarget.dataset.url] // 需要预览的图片http链接列表
    })
  },
  
  operate(e){
    if(this.data.info.orderState == 1) return
    let {item} = e.currentTarget.dataset;
    item.itemSts = item.itemSts+'';
    if(item.itemSts == 2){
      item.imgData = [
        {url:'http://47.106.207.122:2080//group1/M00/00/01/rBKgRGL163CATux8AAAEALf_SOk924_big.png'}
      ]
    }
    this.setData({showAlert:true,currentItem:item});
  },
  
  async afterRead(event) {
    wx.showLoading();
    const { file } = event.detail;
    let {id} = event.currentTarget.dataset;
    let {data} = await util.uploadFile(file);
    wx.hideLoading();
    data = JSON.parse(data);  //数据转化
    console.log(data);
    this.setData({
      ['currentItem.imgId']:data.content.flowId,
      ['currentItem.imgPath']:data.content.storePath,
      ['currentItem.imgData']:[{...file,url:common.getBigImgPath(data.content.fullPath)}]
    })
  },

  // 删除照片
  deleteImg(){
    this.setData({['currentItem.imgData']:[]});
  },

  changeSts(e){
    this.setData({['currentItem.itemSts']:e.detail})
  },
  textareaSetData(e){
    this.setData({['currentItem.remark']:e.detail.value})
  },
  cancelAlert(){
    this.setData({['showAlert']:false})
  },
  async sureAlert(){
    await util.postByBeanName('wmsExamineTF','examineOrder',this.data.currentItem); 
    this.cancelAlert();
    this.doQuery();
    wxApi.showToast('操作成功')
  },
  // 一键确认
  async allSure(){
    await util.postByBeanName('wmsExamineTF','oneKeyExamineOrder',{examineItemId:this.data.info.examineItemList[0].examineItemId}); 
    wxApi.showToast('操作成功');
    this.doQuery();
  }
})