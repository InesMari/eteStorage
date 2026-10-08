import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    packObjData:[],
    manualAddCodeAlert:false,
    manualAddCodeList:[{}],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    this.doQuery();
  },
  async doQuery(){
    let outOrderMaterialList = await util.postByBeanName('wmsOutOrderTF','getOutOrderInfo');
    this.setData({outOrderMaterialList,outOrderMaterialListCache:outOrderMaterialList})
  },  
  changeTab(e){
    let {index} = e.currentTarget.dataset;
    this.data.info.outMaterialList.forEach(item => {
      item.active = false;
    })
    this.data.info.outMaterialList[index].active = true;
    this.setData({currentMaterialIndex:index,['info.outMaterialList']:this.data.info.outMaterialList});
  },
  // 选择出库单号popover
  showOutOrderMaterialPopover(){
    this.setData({isShowOutOrderMaterialPopover:true})
  },
  /**
   * 选择出库单号
   */
  async selectOutOrderMaterial(e){
    let { item } = e.currentTarget.dataset;
    this.queryOrder(item.outOrderId);
  },
  // 查出库单
  async queryOrder(outOrderId){
    let info = await util.postByBeanName('wmsOutOrderTF','queryWmsOutOrderInfoForApp',{outOrderId});
    info.outOrderId = outOrderId;
    // 初始化扫码统计
    info.baseInfo.scanTotal = 0;
    // 初始化条码数组
    if(common.isBlank(info.qrcodeList)) info.qrcodeList = [];
    // 赋值
    this.setData({
      isShowOutOrderMaterialPopover:false,
      info,
      currentMaterialIndex:0,
    });
    // this.calcscanNums();

  },
  // 本地遍历查询出库单号
  searchOutOrderMaterialList(e){
    let value = e.detail.value;
    this.setData({ outOrderMaterialSearch: value });
    let outOrderMaterialList = [];
    this.data.outOrderMaterialListCache.forEach(el => {
      if(el.inOrderNum.indexOf(value)>-1){  
        outOrderMaterialList.push(el);
      }                       
    })
    this.setData({outOrderMaterialList});
  },


  inputSetData(e){
    let {value} = e.detail;
    let {index,key} = e.currentTarget.dataset;
    this.setData({
      ['info.outMaterialList['+index+'].'+key]:value,
    });
  },

  // 是否冻结
  onFreezeChange(e){
    let value = e.detail;
    value = value?1:0;
    let {index} = e.currentTarget.dataset;
    this.setData({
      ['info.outMaterialList['+this.data.currentMaterialIndex+'].list['+index+'].freezeState']:value,
    });
  },
  // 出库单扫码
  orderScan(){
    let _this = this;    
    wx.scanCode({
      success (res) {
        let qrCode = res.result;   //出库单号
        _this.data.outOrderMaterialList.forEach(el => {
          if(el.inOrderNum = qrCode){
            _this.queryOrder(el.outOrderId);
          }
        })
      }
    });
  },
  // 物料出库扫码
  async mScan(e){
    let _this = this;
    console.log('为了用于单据上传的拍照以及扫描识别二维码，开发者将在获取你的明示同意后，访问你的摄像头。')
    wx.scanCode({
      async success (res) {
        let codeNum = res.result;   //物料编码
        let info = await util.postByBeanName('wmsOutOrderTF','getWmsQrcodeInfo',{outOrderId:_this.data.info.outOrderId,codeNum},null,null,null,false);
        console.log(info)
        let qrcodeList = common.copyObj(_this.data.info.qrcodeList);
        qrcodeList.push(info);
        if(_this.calcMateriaInfo(qrcodeList)){
          _this.calcscanNums();
        }
      }
    })
  },
  // 时代条码扫码
  sdCodeScan(e){
    let _this = this;
    let {index} = e.currentTarget.dataset;
    wx.scanCode({
      success(res) {
        let codeNum = res.result; //时代条码
        _this.setData({
          ['info.outMaterialList[' + index + '].codeNum']: codeNum,
        });
      }
    });
  },
  // 计算物料出库信息
  calcMateriaInfo(qrcodeList = this.data.info.qrcodeList){
    let {outMaterialList} = this.data.info;
    let overflow = false;
    outMaterialList.forEach(item => {
      item.scanTotal = 0;
      item.scanNums = 0;
      qrcodeList.forEach(el => {
        if(item.stockMaterialDtlId == el.stockMaterialDtlId){
          item.scanTotal++;
          item.scanNums += el.nums;
        }
      })
      // 判断数量是否溢出
      if(item.scanNums>item.planNums){
        overflow = true;
      }
    })
    if(overflow){
      wxApi.showToast("超出物料出库数量。");
      return false;
    }else {
      this.setData({['info.outMaterialList']:outMaterialList,['info.qrcodeList']:qrcodeList});
      return true;
    }
  },
  // 统计扫码累计数量
  calcscanNums(){    
    let total = 0;
    this.data.info.qrcodeList.forEach(item => {
      total += Number(item.nums)
    })
    this.setData({['info.baseInfo.scanTotal']:total});
  },
  // 删除物料
  delCode(e){
    let {index} = e.currentTarget.dataset;
    this.data.info.qrcodeList.splice(index,1);
    this.setData({['info.qrcodeList']:this.data.info.qrcodeList});
    this.calcMateriaInfo();
    this.calcscanNums();
  },
  // 包材数量
  inputSetPackData(e){
    let {value} = e.detail;
    let {index} = e.currentTarget.dataset;
    this.setData({
      ['info.packMaterialList['+index+'].realNums']:value,
    });
  },
  async submit(){
    await util.postByBeanName('wmsOutOrderTF','outOrderScanQrcode',this.data.info);
    await wxApi.showModal('提交成功');
    wx.navigateBack({
      delta: 1,
    })
  },
})