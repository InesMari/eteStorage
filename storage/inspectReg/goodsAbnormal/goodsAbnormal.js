import {util,wxApi,common,regeneratorRuntime} from '../../../common/commonImport'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info:{
      imgList:[]
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function ({id}) {
    if(common.isNotBlank(id)) this.doQuery(id)
  },
  async doQuery(id){
    let info = await util.postByBeanName('wmsInspectionExceptionRecordService','loadWmsInspectionExceptionRecordDataById',{id});
    info.imgList.forEach(item => {
      item.url = item.fullPath;
    })
    info = {...info.info,imgList:info.imgList};
    this.setData({info,disabled:true})
  },
  //原生 - input赋值
  inputSetDataDefault(e){
    let {value} = e.detail;
    let { key } = e.currentTarget.dataset;
    this.setData({['info.'+key]:value});
  },
  async afterRead(event) {
    wx.showLoading();
    const { file } = event.detail;
    let {index} = event.currentTarget.dataset;
    let {data} = await util.uploadFile(file);
    wx.hideLoading();
    data = JSON.parse(data);  //数据转化
    console.log(data);    
    let obj = {};
    obj.url = common.getBigImgPath(data.content.fullPath);
    obj.imgId = data.content.flowId;
    obj.imgPath = data.content.storePath;
    obj.fullPath = data.content.fullPath;
    obj.fileName = data.content.fileName;
    this.data.info.imgList.push(obj);
    this.setData({['info.imgList']:this.data.info.imgList});
  },
  // 删除照片
  deleteImg(event){
    let index = event.detail.index;
    this.data.info.imgList.splice(index,1);
    this.setData({['info.imgList']:this.data.info.imgList});
  },
  // 作业点要求时间
  changeDate(e){
    let value = e.detail;
    this.setData({['info.planDealDate']:value});
  },
  async submit(){
    this.data.info.workStoreId = wx.getStorageSync('userInfo').workId;
    await util.postByBeanName('wmsInspectionExceptionRecordService','saveOrUpdateWmsInspectionExceptionRecord',this.data.info);
    await wxApi.showModal("提交成功")
    wx.redirectTo({
      url: '../goodsAbnormalList/goodsAbnormalList',
    })
  }
})