import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    packMaterialBaseIndex:null,
    arrivalManufacturerTenantIndex:null,
    wmsPackOpTypeIndex:null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.queryStaticData();
  },
  // 查询静态数据
  async queryStaticData(){
    //静态枚举    
    let packMaterialBaseList = await util.postByBeanName('wmsPackMaterialTF','queryPackMaterialBaseList');  //包材名称
    let arrivalManufacturerTenantList = await util.postByBeanName('wmsTenantTF','queryArrivalManufacturerTenantList',{isLoadETE: 1}); //所属用户
    let wmsList = await util.postByBeanName('commonTF','getSysStaticData',{codeType: "WMS_PACK_OP_TYPE"});  //登记类型
    let wmsPackOpTypeList = [];  //登记类型
    wmsList.forEach(el => {
      if(el.codeValue!="4" && el.codeValue!="5"){
        wmsPackOpTypeList.push(el)
      }
    });
    this.setData({packMaterialBaseList,arrivalManufacturerTenantList,wmsPackOpTypeList});
  },
  // 包材名称切换
  packMaterialBaseChange(e){
    let {value} = e.detail;
    let { index } = e.currentTarget.dataset;
    this.setData({
      ['info.pId']:this.data.packMaterialBaseList[value].pId,
      packMaterialBaseIndex:value,
    });
  },
  // 所属用户切换
  arrivalManufacturerTenantChange(e){
    let {value} = e.detail;
    let { index } = e.currentTarget.dataset;
    this.setData({
      ['info.srcTenantId']:this.data.arrivalManufacturerTenantList[value].wId,
      arrivalManufacturerTenantIndex:value,
    });
  },
  // 登记类型切换
  wmsPackOpTypeChange(e){
    let {value} = e.detail;
    let { index } = e.currentTarget.dataset;
    this.setData({
      ['info.opType']:this.data.wmsPackOpTypeList[value].codeValue,
      wmsPackOpTypeIndex:value,
    });
  },
  // 作业点要求时间
  changeDate(e){
    let value = e.detail;
    let { index } = e.currentTarget.dataset;
    this.setData({['info.realDate']:value});
  },
  //原生 - input赋值
  inputSetDataDefault(e){
    let {value} = e.detail;
    let { key } = e.currentTarget.dataset;
    this.setData({['info.'+key]:value});
  },
  async submit(){
    await util.postByBeanName('wmsPackMaterialTF','packMaterialRegister',this.data.info);
    await wxApi.showModal("登记成功")
    wx.navigateBack({
      delta: 1,
    })
  }
})