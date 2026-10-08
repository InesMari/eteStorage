import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    info:{},  //提交对象
    showFinish:false,   //显示完成页面
    isShowVehiclePopover:false,   //是否展示选择输入车辆弹窗
    vehicleList:[],  //车辆列表（前端显示用）
    vehicleAllList:[], //车辆列表（全部数据）
    vehicleFilteredList:[], //车辆搜索后的完整过滤列表
    vehicleFilteredLength:0, //车辆过滤后的完整列表长度
    vehicleSearch:"",   //输入的车牌号
    vehicleDisplayCount:20, //前端显示数量
    isShowDriverPopover:false,   //是否展示选择输入司机弹窗
    driverList:[],  //司机列表（前端显示用）
    driverAllList:[], //司机列表（全部数据）
    driverFilteredList:[], //司机搜索后的完整过滤列表
    driverFilteredLength:0, //司机过滤后的完整列表长度
    driverSearch:"",    //输入的司机名称
    driverDisplayCount:20, //前端显示数量
    isShowSupplierPopover:false,   //是否展示选择输入供应商弹窗
    supplierList:[],  //供应商列表（前端显示用）
    supplierAllList:[], //供应商列表（全部数据）
    supplierFilteredList:[], //供应商搜索后的完整过滤列表
    supplierFilteredLength:0, //供应商过滤后的完整列表长度
    supplierSearch:"",   //输入的供应商名称
    supplierDisplayCount:20, //前端显示数量
    step:1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad({info}) {
    info = JSON.parse(decodeURI(info));
    this.setData({info})
    this.queryStaticData();
    this.querySupplier();
    // 返回监听
    wx.enableAlertBeforeUnload({
      message:"是否返回调度列表？（填写信息将丢失）",
    })
  },

  // 查询供应商列表（一次性获取全部数据）
  async querySupplier(){
    let supplierList = await util.postByBeanName('supplierTF','queryAllSupplierList');
    this.setData({
      supplierAllList: supplierList,
      supplierList: supplierList.slice(0, 20)
    })
  },

  /**
   * 查询提货车辆、提货司机列表（一次性获取全部数据）
   */
  async queryList(){
    let count = 9999;
    let {items:vehicleList} = await util.postByBeanName('resVehicleInfoTF','selVehicleInfoListByCond',{tenantId:this.data.info.supplierTenantId,count});
    let {items:driverList} = await util.postByBeanName('driverTF','selDriverInfoListByCond',{tenantId:this.data.info.supplierTenantId,count});
    this.setData({
      vehicleAllList: vehicleList,
      vehicleList: vehicleList.slice(0, 20),
      driverAllList: driverList,
      driverList: driverList.slice(0, 20)
    })
  },

  // 查询静态枚举
  async queryStaticData(){
    let {VEHICLE_TYPE,VEHICLE_LENGTH,WHETHER,BILLING_TYPE_ORDER,VEHICLE_TYPE_QUOTE} = await util.postByBeanName('commonTF','getSysStaticDataByCodeTypes',{codeType:"VEHICLE_TYPE,VEHICLE_LENGTH,WHETHER,BILLING_TYPE_ORDER,VEHICLE_TYPE_QUOTE"});
    this.setData({
      vehicleTypeList:VEHICLE_TYPE,
      vehicleLengthList:VEHICLE_LENGTH,
      invoiceList:WHETHER,
      billingTypeList:BILLING_TYPE_ORDER,
      quoteVehicleTypeList:VEHICLE_TYPE_QUOTE,
    })
  },

  //切换车辆类型
  changeTab(e){
    let { key } = e.currentTarget.dataset;
    this.setData({tabAct:key});
  },
  // 选择供应商
  supplierChange(e){
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

  // 选择车辆popover
  async showVehiclePopover(){
    this.setData({
      isShowVehiclePopover:true,
      vehicleSearch:"",
      vehicleDisplayCount:20,
      vehicleList: this.data.vehicleAllList.slice(0, 20)
    })
  },
  /**
   * 选择车辆
   */
  selectVehicle(e){
    let { item } = e.currentTarget.dataset;
    // 选择车辆逻辑
    this.setData({ 
      ['info.plateNumber']: item.plateNumber, 
      ['info.vehicleId']: item.vehicleId,
      ['info.vehicleType'] : item.vehicleType,
      ['info.vehicleLength'] : item.vehicleLength,
      isShowVehiclePopover:false 
    });
    this.eachPickerData(this.data.vehicleTypeList,item.vehicleType,'vehicleTypeIndex');   //回显车型
    this.eachPickerData(this.data.vehicleLengthList,item.vehicleLength,'vehicleLengthIndex');   //回显车长
  },

  // 搜索车辆
  searchVehicleList(e){
    let value = e.detail.value;
    this.setData({ vehicleSearch: value });
    //延迟搜索
    if (this.data.searchTimeout) clearTimeout(this.data.searchTimeout);
    this.data.searchTimeout = setTimeout(() => {
      let filteredList = [];
      if (value) {
        filteredList = this.data.vehicleAllList.filter(item => item.plateNumber && item.plateNumber.indexOf(value) > -1);
      } else {
        filteredList = this.data.vehicleAllList;
      }
      this.setData({
        vehicleList: filteredList.slice(0, 20),
        vehicleDisplayCount: 20,
        vehicleFilteredList: filteredList,
        vehicleFilteredLength: filteredList.length
      });
      clearTimeout(this.data.searchTimeout);
    }, 300)
  },

  // 车辆滚动到底部加载更多
  onVehicleScrolltolower() {
    let { vehicleList, vehicleAllList, vehicleFilteredList, vehicleSearch, vehicleDisplayCount, vehicleFilteredLength } = this.data;
    let sourceList = vehicleSearch ? vehicleFilteredList : vehicleAllList;
    let totalCount = vehicleSearch ? vehicleFilteredLength : vehicleAllList.length;
    let currentCount = vehicleDisplayCount;
    let newCount = currentCount + 20;
    
    if (newCount < totalCount) {
      this.setData({
        vehicleList: sourceList.slice(0, newCount),
        vehicleDisplayCount: newCount
      });
    } else {
      this.setData({
        vehicleList: sourceList,
        vehicleDisplayCount: totalCount
      });
    }
  },

  // 选择司机popover
  async showDriverPopover(){
    this.setData({
      isShowDriverPopover:true,
      driverSearch:"",
      driverDisplayCount:20,
      driverList: this.data.driverAllList.slice(0, 20)
    })
  },
  /**
   * 选择司机
   */
  selectDriver(e){
    let { item } = e.currentTarget.dataset;
    //选择司机逻辑
    this.setData({ 
      ['info.driverName']: item.driverName, 
      ['info.driverUserId']: item.driverUserId, 
      ['info.driverPhone']: item.driverPhone, 
      isShowDriverPopover:false
    })
  },

  // 搜索司机
  searchdriverList(e){
    let value = e.detail.value;
    this.setData({ driverSearch: value });
    //延迟搜索
    if (this.data.searchTimeout) clearTimeout(this.data.searchTimeout);
    this.data.searchTimeout = setTimeout(() => {
      let filteredList = [];
      if (value) {
        filteredList = this.data.driverAllList.filter(item => item.driverName && item.driverName.indexOf(value) > -1);
      } else {
        filteredList = this.data.driverAllList;
      }
      this.setData({
        driverList: filteredList.slice(0, 20),
        driverDisplayCount: 20,
        driverFilteredList: filteredList,
        driverFilteredLength: filteredList.length
      });
      clearTimeout(this.data.searchTimeout);
    }, 300)
  },

  // 司机滚动到底部加载更多
  onDriverScrolltolower() {
    let { driverList, driverAllList, driverFilteredList, driverSearch, driverDisplayCount, driverFilteredLength } = this.data;
    let sourceList = driverSearch ? driverFilteredList : driverAllList;
    let totalCount = driverSearch ? driverFilteredLength : driverAllList.length;
    let currentCount = driverDisplayCount;
    let newCount = currentCount + 20;
    
    if (newCount < totalCount) {
      this.setData({
        driverList: sourceList.slice(0, newCount),
        driverDisplayCount: newCount
      });
    } else {
      this.setData({
        driverList: sourceList,
        driverDisplayCount: totalCount
      });
    }
  },

  // 选择供应商popover
  showSupplierPopover(){
    this.setData({
      isShowSupplierPopover:true,
      supplierSearch:"",
      supplierDisplayCount:20,
      supplierList: this.data.supplierAllList.slice(0, 20)
    })
  },
  /**
   * 选择供应商
   */
  selectSupplier(e){
    let { item } = e.currentTarget.dataset;
    //选择供应商逻辑
    this.setData({
      ["info.supplierTenantId"]: item.tenantId,
      ["info.supplierName"]: item.supplierName,
      ["info.isInvoice"]: item.invoiceFlg,
      supplierSearch:"",
      isShowSupplierPopover:false
    });
    this.data.invoiceList.forEach((el,index)=>{
      if(el.codeValue == item.invoiceFlg){
        this.setData({invoiceIndex:index})
      }
    })
    this.queryList();
  },

  // 搜索供应商
  searchSupplierList(e){
    let value = e.detail.value;
    this.setData({ supplierSearch: value });
    //延迟搜索
    if (this.data.searchTimeout) clearTimeout(this.data.searchTimeout);
    this.data.searchTimeout = setTimeout(() => {
      let filteredList = [];
      if (value) {
        filteredList = this.data.supplierAllList.filter(item => item.supplierName && item.supplierName.indexOf(value) > -1);
      } else {
        filteredList = this.data.supplierAllList;
      }
      this.setData({
        supplierList: filteredList.slice(0, 20),
        supplierDisplayCount: 20,
        supplierFilteredList: filteredList,
        supplierFilteredLength: filteredList.length
      });
      clearTimeout(this.data.searchTimeout);
    }, 300)
  },

  // 供应商滚动到底部加载更多
  onSupplierScrolltolower() {
    let { supplierList, supplierAllList, supplierFilteredList, supplierSearch, supplierDisplayCount, supplierFilteredLength } = this.data;
    let sourceList = supplierSearch ? supplierFilteredList : supplierAllList;
    let totalCount = supplierSearch ? supplierFilteredLength : supplierAllList.length;
    let currentCount = supplierDisplayCount;
    let newCount = currentCount + 20;
    
    if (newCount < totalCount) {
      this.setData({
        supplierList: sourceList.slice(0, newCount),
        supplierDisplayCount: newCount
      });
    } else {
      this.setData({
        supplierList: sourceList,
        supplierDisplayCount: totalCount
      });
    }
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
  quoteVehicleTypeChange(e){
    let {value} = e.detail;
    let codeValue = this.data.quoteVehicleTypeList[value].codeValue;
    this.setData({
      ['info.quoteVehicleType']:codeValue,
      'quoteVehicleTypeIndex':value,
    });
  },

  // 查询费用
  async queryFee(){
    let {orderId,goodsInfoList,billingType,quoteVehicleType,vehicleLength,netWeight,grossWeight,volume,supplierTenantId} = this.data.info;
    if(common.isBlank(billingType)){
      wxApi.showToast("请选择计费方式");
      return false
    }
    if(common.isBlank(quoteVehicleType)){
      wxApi.showToast("请选择报价车型");
      return false
    }
    if(common.isBlank(vehicleLength)){
      wxApi.showToast("请选择车辆");
      return false
    }
    if(billingType!=1){ //按整车时候不做限制
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
    }
    if(common.isNotBlank(goodsInfoList)){
      for(let item of goodsInfoList){
        if(common.isBlank(item.actualGoodsCount)){
          wxApi.showToast("请输入实际件数");
          return false
        }
      }
    }
    let res = await util.postByBeanName('ZCQuoteNewTF','querySupplierZCBestQuoteForWechat',{orderId,goodsInfoList,billingType,quoteVehicleType,vehicleLength,netWeight,grossWeight,volume,tenantId:supplierTenantId});
    let info = this.data.info;
    Object.assign(info,res);
    this.setData({info})
  },

  inputSetDataFeeInfo(e){
    let {value} = e.detail;
    let { key } = e.currentTarget.dataset;
    this.setData({ ['info.feeInfo.'+key]: value });
    this.calculateTotalFee();
  },
  //计算总金额
  calculateTotalFee(){
    let feeInfo = this.data.info.feeInfo || {};
    // 保险费 + 装货费
    feeInfo.totalFee = common.accAdd(feeInfo.premiumFee,feeInfo.loadingFee);
    // 卸货费
    feeInfo.totalFee = common.accAdd(feeInfo.totalFee,feeInfo.dischargeFee);
    // 放空费
    feeInfo.totalFee = common.accAdd(feeInfo.totalFee,feeInfo.emptyDrivingFee);
    // 压夜费
    feeInfo.totalFee = common.accAdd(feeInfo.totalFee,feeInfo.standbyFee);
    // 其他费
    feeInfo.totalFee = common.accAdd(feeInfo.totalFee,feeInfo.otherFee);
    // 异动总费用
    feeInfo.abnormalTotalFee = common.accAdd(feeInfo.totalFee,this.data.info.totalFee);
    
    // 赋值
    this.setData({['info.feeInfo']:feeInfo});
  },

  // 上一步
  toPre(e){
    this.setData({step:Number(e.currentTarget.dataset.step)-1});
  },
  // 下一步
  async toNext(e){
    let step = Number(e.currentTarget.dataset.step)
    
    switch(step){
      case 1:
        if(!this.data.info.supplierName){
          wxApi.showToast("请选择供应商");
          return
        }
        break;
      case 2:
        let result = await this.queryFee();
        if(result === false) return
        break;
      case 3:
        this.calculateTotalFee();
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
