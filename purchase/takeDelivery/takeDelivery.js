import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowPurchasePopover:false,
    fileList:[],
    realList:[],
    info:{},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.queryPurchase();
  },
  // 查询采购信息
  async queryPurchase(){
    let purchaseList = await util.postByBeanName('purPurchaseService','queryPurPurchaseList');
    this.setData({purchaseList,purchaseListCache:purchaseList});
  },
  
  //原生 - input赋值
  inputSetDataDefault(e){
    let {value} = e.detail;
    let { key } = e.currentTarget.dataset;
    this.setData({['info.'+key]:value});
  },
  inputSetDataItem(e){
    let {value} = e.detail;
    let { key,index } = e.currentTarget.dataset;
    this.setData({['dtlList['+index+'].'+key]:value});
  },
  
  // 采购单列表 - popover
  showPurchasePopover(){
    this.setData({isShowPurchasePopover:true})
  },
  /**
   * 选择采购单
   */
  selectPurchase(e){
    let { item } = e.currentTarget.dataset;
    this.setData({ 
      isShowPurchasePopover:false
    })
    this.queryDetail(item);
  },
  // 筛选采购单列表 - popver
  searchPurchaseList(e){
    let value = e.detail.value;
    this.setData({ purchaseSearch: value });
    //延迟查询
    if (this.data.searchTimeout) clearTimeout(this.data.searchTimeout);
    this.data.searchTimeout = setTimeout(async () => {
      let purchaseList = [];
      this.data.purchaseListCache.forEach(el => {
        if(el.purchaseNum.indexOf(value) > -1){
          purchaseList.push(el);
        }
      })
      this.setData({purchaseList});
      clearTimeout(this.data.searchTimeout);
    }, 300)
  },
  // 查询明细
  async queryDetail(item){
    let info = await util.postByBeanName('purPurchaseService','loadPurPurchaseById',{id:item.id});
    info.info.workName = item.workName;
    // info.info.inDate = this.data.info.inDate?this.data.info.inDate:'';
    // info.info.orderRemark = this.data.info.orderRemark?this.data.info.orderRemark:'';
    this.setData({info:info.info,dtlList:info.dtlList});
  },
  // 上传交货单
  async afterRead(event) {
    wx.showLoading();
    const { file } = event.detail;
    let {data} = await util.uploadFile(file);
    wx.hideLoading();
    data = JSON.parse(data);  //数据转化
    let fileList = [];
    let obj = {};
    obj.url = common.getBigImgPath(data.content.fullPath);
    fileList.push(obj);
    this.setData({
      ['info.imgId']:data.content.flowId,
      ['info.imgPath']:data.content.storePath,
      fileList,
    })
  },
  // 删除照片
  deleteImg(){
    this.setData({
      ['info.imgId']:'',
      ['info.imgPath']:'',
      fileList:[],
    })
  },
  // 上传实物图
  async afterReadReal(event) {
    wx.showLoading();
    const { file } = event.detail;
    let {data} = await util.uploadFile(file);
    wx.hideLoading();
    data = JSON.parse(data);  //数据转化
    let realList = [];
    let obj = {};
    obj.url = common.getBigImgPath(data.content.fullPath);
    realList.push(obj);
    this.setData({
      ['info.realImgId']:data.content.flowId,
      ['info.realImgPath']:data.content.storePath,
      realList,
    })
  },
  // 删除实物图
  deleteImgReal(){
    this.setData({
      ['info.realImgId']:'',
      ['info.realImgPath']:'',
      realList:[],
    })
  },


  async sure(){    
    let {purchaseNum,inDate} = this.data.info;
    if(common.isBlank(purchaseNum)){
      wxApi.showToast("请选择采购单！");
      return
    }
    if(common.isBlank(inDate)){
      wxApi.showToast("请选择入库日期！");
      return
    }
    let {confirm} = await wxApi.showModal({
      title:"提示",
      content:"您正在操作收货入库确认，是否继续？",
      showCancel:true
    })
    if(confirm){
      this.data.info.dtlList = this.data.dtlList;
      await util.postByBeanName('purPurchaseOrderDeliveryService','savePurPurchaseOrderDelivery',this.data.info);
      await wxApi.showModal("入库成功")
      wx.navigateBack({
        delta: 1,
      })
    }
  },
})