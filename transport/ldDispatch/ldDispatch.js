import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    info:{},  //提交对象
    tabAct:0,   //车辆类型，0：提货车辆，1：干线车辆，2：送货车辆
    isShowVehiclePopover:false,   //是否展示选择输入车辆弹窗
    vehicleList:[],  //车辆列表
    vehicleSearch:"",   //输入的车牌号
    vehicleListHasNext:false, //车辆列表是否有下一页
    isShowDriverPopover:false,   //是否展示选择输入司机弹窗
    driveList:[],  //司机列表
    driverSearch:[],    //输入的司机名称
    driveListHasNext:false, //司机列表是否有下一页
    step:1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad({info}) {
    info = JSON.parse(decodeURI(info));
    this.setData({info})
    this.initInfoVehicleList();
    this.queryStaticData();
    this.querySupplier();
    // 返回监听
    wx.enableAlertBeforeUnload({
      message:"是否返回调度列表？（填写信息将丢失）",
    })
  },
  /**
   * 初始化发车类型数组
   */
  initInfoVehicleList(){
    let vehicleList = [];
    for(let i=0;i<3;i++){
      let obj = {
        vehicleId:"",
        driverUserId:"",
        driverPhone:""
      }
      switch(i){
        case 0:
          obj.typeName = "提货"
          break;
        case 1:
          obj.typeName = "干线"
          break;
        case 2:
          obj.typeName = "送货"
          break;
      }
      vehicleList.push(obj);
    }
    this.setData({['info.vehicleList']:vehicleList});
  },
  // 查询供应商列表
  async querySupplier(){
    let supplierList = await util.postByBeanName('supplierTF','queryAllSupplierList');  //供应商
    this.setData({supplierList})
  },
  /**
   * 查询提货车辆、提货司机列表
   */
  async queryList(){
    let vehicleList = await util.postByBeanName('resVehicleInfoTF','selVehicleInfoListByCond',{tenantId:this.data.info.supplierTenantId});  //车辆
    let driveList = await util.postByBeanName('driverTF','selDriverInfoListByCond',{tenantId:this.data.info.supplierTenantId});   //司机
    this.setData({
      vehicleList:vehicleList.items,
      vehicleListHasNext:vehicleList.hasNext,
      driveList:driveList.items,
      driveListHasNext:driveList.hasNext
    })
  },
  // 查询静态枚举
  async queryStaticData(){
    let {VEHICLE_TYPE,VEHICLE_LENGTH,WHETHER,BILLING_TYPE_ORDER,TRANSPORT} = await util.postByBeanName('commonTF','getSysStaticDataByCodeTypes',{codeType:"VEHICLE_TYPE,VEHICLE_LENGTH,WHETHER,BILLING_TYPE_ORDER,TRANSPORT"});
    // 零担不需要整车类型
    BILLING_TYPE_ORDER.forEach((item,index) => {
      if(item.codeValue == 1){
        BILLING_TYPE_ORDER.splice(index,1)
      }
    })
    this.setData({
      vehicleTypeList:VEHICLE_TYPE,
      vehicleLengthList:VEHICLE_LENGTH,
      invoiceList:WHETHER,
      billingTypeList:BILLING_TYPE_ORDER,
      transportList:TRANSPORT,
    })
  },

  //切换车辆类型
  changeTab(e){
    let { key } = e.currentTarget.dataset;
    this.setData({tabAct:key});
  },
  // 选择供应商
  supplierChange(e){
    this.initInfoVehicleList();
    let { value } = e.detail;
    let supplier = this.data.supplierList[value];
    this.setData({
      ["info.supplierTenantId"]: supplier.tenantId,
      ["info.isInvoice"]: supplier.invoiceFlg,
      'supplierIndex': value
    });
    this.data.invoiceList.forEach((el,index)=>{
      if(el.codeValue == supplier.invoiceFlg){
        this.setData({invoiceIndex:index})
      }
    })
  },
  // 选择车型
  vehicleTypeChange(e){
    let tabAct = this.data.tabAct;
    let { value } = e.detail;
    let { key } = e.currentTarget.dataset;
    this.setData({
      ['info.vehicleList['+tabAct+'].vehicleType'] : this.data.vehicleTypeList[value].codeValue,
      ['info.vehicleList['+tabAct+'].vehicleTypeIndex'] : value,
    })
  },
  // 选择车长
  vehicleLengthChange(e){
    let tabAct = this.data.tabAct;
    let { value } = e.detail;
    let { key } = e.currentTarget.dataset;
    this.setData({
      ['info.vehicleList['+tabAct+'].vehicleLength'] : this.data.vehicleTypeList[value].codeValue,
      ['info.vehicleList['+tabAct+'].vehicleLengthIndex'] : value,
    })
  },

  // 遍历回显picker值
  eachPickerData(list,codeValue,idxName){
    list.forEach(el => {
      if(el.codeValue == codeValue){
        this.setData({[idxName]:codeValue});
      }
    })
  },

  //原生 - input赋值
  inputSetDataDefault(e){
    let {value} = e.detail;
    let { key } = e.currentTarget.dataset;
    this.data.info[key] = value;
    this.setData({ info: this.data.info });
  },
  //列表输入框 - input赋值
  inputSetDataList(e){
    let {value} = e.detail;
    let { key } = e.currentTarget.dataset;
    this.setData({ ['info.vehicleList['+this.data.tabAct+'].'+key]: value });
  },

  // 选择车辆popover
  showVehiclePopover(){
    this.queryList();
    this.setData({isShowVehiclePopover:true})
  },
  /**
   * 选择车辆
   */
  selectVehicle(e){
    let tabAct = this.data.tabAct;
    let { item } = e.currentTarget.dataset;
    // 输入车辆逻辑
    if(common.isBlank(item)){
      this.setData({
        ['info.vehicleList['+tabAct+'].plateNumber']: this.data.vehicleSearch,
        isShowVehiclePopover:false 
      });
      return;
    }
    // 选择车辆逻辑
    let obj = {}
    this.setData({ 
      ['info.vehicleList['+tabAct+'].plateNumber']: item.plateNumber, 
      ['info.vehicleList['+tabAct+'].vehicleId']: item.vehicleId,
      ['info.vehicleList['+tabAct+'].vehicleType'] : item.vehicleType,
      ['info.vehicleList['+tabAct+'].vehicleLength'] : item.vehicleLength,
      isShowVehiclePopover:false 
    });
    this.eachPickerData(this.data.vehicleTypeList,item.vehicleType,'info.vehicleList['+tabAct+'].vehicleTypeIndex');   //回显车型
    this.eachPickerData(this.data.vehicleLengthList,item.vehicleLength,'info.vehicleList['+tabAct+'].vehicleLengthIndex');   //回显车长
    //清空车辆搜索输入框
    this.setData({vehicleSearch:""})
  },
  // 查询车辆
  searchVehicleList(e){
    let value = e.detail.value;
    this.setData({ vehicleSearch: value });
    //延迟查询
    if (this.data.searchTimeout) clearTimeout(this.data.searchTimeout);
    this.data.searchTimeout = setTimeout(async () => {
      let vehicleList = await util.postByBeanName('resVehicleInfoTF','selVehicleInfoListByCond',{tenantId:this.data.info.supplierTenantId,plateNumber:value}); 
      this.setData({
        vehicleList:vehicleList.items,
        vehicleListHasNext:vehicleList.hasNext,
      })
      clearTimeout(this.data.searchTimeout);
    }, 300)
  },

  // 选择司机popover
  showDriverPopover(){
    this.queryList();
    this.setData({isShowDriverPopover:true})
  },
  /**
   * 选择司机
   */
  selectDriver(e){
    let tabAct = this.data.tabAct;
    let { item } = e.currentTarget.dataset;
    // 输入司机逻辑
    if(common.isBlank(item)){
      this.setData({
        ['info.vehicleList['+tabAct+'].driverName']: this.data.driverSearch,
        isShowDriverPopover:false 
      });
      return;
    }
    //选择司机逻辑
    this.setData({ 
      ['info.vehicleList['+tabAct+'].driverName']: item.driverName, 
      ['info.vehicleList['+tabAct+'].driverUserId']: item.driverUserId, 
      ['info.vehicleList['+tabAct+'].driverPhone']: item.driverPhone, 
      isShowDriverPopover:false 
    })
    //清空司机搜索输入框
    this.setData({driverSearch:""})
  },
  // 查询司机
  searchDriveList(e){
    let value = e.detail.value;
    this.setData({ driverSearch: value });
    //延迟查询
    if (this.data.searchTimeout) clearTimeout(this.data.searchTimeout);
    this.data.searchTimeout = setTimeout(async () => {
      let driveList = await util.postByBeanName('driverTF','selDriverInfoListByCond',{tenantId:this.data.info.supplierTenantId,plateNumber:value});
      this.setData({
        driveList:driveList.items,
        driveListHasNext:driveList.hasNext,
      })
      clearTimeout(this.data.searchTimeout);
    }, 300)
  },

  // 选择计费方式
  billingTypeChange(e){
    let {value} = e.detail;
    let codeValue = this.data.billingTypeList[value].codeValue;
    this.setData({
      ['info.billingType']:codeValue,
      'billingTypeIndex':value,
    });
    //按件计费
    if(codeValue == '5'){
      this.getPieceGoods();
    }
  },
  //按件计费
  async getPieceGoods(){
    let goodsInfoList = await util.postByBeanName('ordWaybillTF','getPieceGoodsForWechat',{orderId:this.data.info.orderId});
    this.data.info.goodsInfoList = goodsInfoList;
    this.setData({info:this.data.info});
  },

  // 实际件数
  inputSetDataGoodsList(e){
    let {value} = e.detail;
    let { index } = e.currentTarget.dataset;
    this.setData({['info.goodsInfoList['+index+'].actualGoodsCount']:value});
  },  

  // 选择报价车型
  transportChange(e){
    let {value} = e.detail;
    let codeValue = this.data.transportList[value].codeValue;
    this.setData({
      ['info.transport']:codeValue,
      'transportIndex':value,
    });
  },

  // 查询费用
  async queryFee(){
    let {orderId,goodsInfoList,billingType,transport,netWeight,grossWeight,volume,supplierTenantId} = this.data.info;
    if(common.isBlank(billingType)){
      wxApi.showToast("请选择计费方式");
      return false
    }
    if(common.isBlank(transport)){
      wxApi.showToast("请选择运输模式");
      return false
    }
    if(common.isBlank(netWeight)){
      wxApi.showToast("请输入净重");
      return false
    }
    if(common.isBlank(grossWeight)){
      wxApi.showToast("请输入毛重");
      return false
    }
    if(common.isBlank(volume)){
      wxApi.showToast("请输入体积");
      return false
    }
    if(common.isNotBlank(goodsInfoList)){
      for(let item of goodsInfoList){
        if(common.isBlank(item.actualGoodsCount)){
          wxApi.showToast("请输入实际件数");
          return false
        }
      }
    }
    let res = await util.postByBeanName('quoteLDNewTF','querySupplierLDBestQuoteForWechat',{orderId,goodsInfoList,billingType,transport,netWeight,grossWeight,volume,tenantId:supplierTenantId});
    let info = this.data.info;
    Object.assign(info,res);
    this.setData({info})
  },  

  // 上一步
  toPre(e){
    this.setData({step:Number(e.currentTarget.dataset.step)-1});
  },
  // 下一步
  async toNext(e){
    let step = Number(e.currentTarget.dataset.step)
    switch(step){
      case 2:
        let result = await this.queryFee();
        if(result === false) return
        break;
    }
    step++;
    this.setData({step});
  },

  // 确定派车
  async submit(){
    let res = await util.postByBeanName('ordWaybillTF','dispatchOrderForWechat',this.data.info);
    this.setData({showFinish:true,waybillNum:res});
  },
  toList(){
    wx.disableAlertBeforeUnload();
    wx.redirectTo({
      url:"../waybillManage/waybillManage"
    })
  }
})