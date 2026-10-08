import {util,wxApi,common,regeneratorRuntime} from '../../../common/commonImport'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    step:1,
    selOutOrderMaterialList:[],
    info:{
      list:[],
      feeList:[],
      costList:[{}],
      billingType:1,  //默认按躺
      isReturn:'0',
    },  
    billingTypeIndex:0,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.queryOutOrder();
    this.querySupplier();
    this.queryStaticData();
  },
  // 查询静态数据
  async queryStaticData(){
    let {VEHICLE_TYPE_QUOTE,BILLING_TYPE_WMS,WMS_COST_ITEM_TYPE} = await util.postByBeanName('commonTF','getSysStaticDataByCodeTypes',{codeType:"VEHICLE_TYPE_QUOTE,BILLING_TYPE_WMS,WMS_COST_ITEM_TYPE"});
    this.setData({billingTypeOrderList:BILLING_TYPE_WMS,vehicleTypeQuoteList:VEHICLE_TYPE_QUOTE,costTypeList:WMS_COST_ITEM_TYPE,costTypeListCahce:WMS_COST_ITEM_TYPE});
  },
  // 查询出库单号列表
  async queryOutOrder(){
    let {items:outOrderMaterialList} = await util.postByBeanName('wmsWaybillService','queryOutOrderMaterialListPage',{rows:999}); 
    this.setData({outOrderMaterialList,outOrderMaterialListCache:outOrderMaterialList})
  },
  // 查询供应商列表
  async querySupplier(){
    let supplierList = await util.postByBeanName('supplierTF','queryAllSupplierList');  //供应商
    this.setData({supplierList,supplierListCache:supplierList})
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
  // 查询费用列表
  async queryFeeList(){
    let srcTenantIds = [];
    this.data.info.list.forEach(el => {
      srcTenantIds.push(el.srcTenantId);
    })
    let feeList = await util.postByBeanName('wmsWaybillService','getDeliverySaleFeeList',{srcTenantIds});  //费用列表
    console.log(feeList);
    // 计算费用数量
    let nums = 0;
    this.data.info.list.forEach(el => {
      nums += el.palletNums2 * el.perPalletNums;
    })
    console.log(nums);
    feeList[0].num = nums;
    this.setData({['info.feeList']:feeList})    
  },
  //原生 - input赋值
  inputSetDataDefault(e){
    let {value} = e.detail;
    let { key } = e.currentTarget.dataset;
    this.data.info[key] = value;
    this.setData({ info: this.data.info });
  },
  // 配送托数 - input赋值
  palletNumInput(e){
    let {value} = e.detail;
    let { index } = e.currentTarget.dataset;
    this.setData({['info.list['+index+'].palletNums2']:value});
  },
  // 成本-金额数量 - input赋值
  inputSetDataCost(e){
    let {value} = e.detail;
    let { index,key } = e.currentTarget.dataset;
    this.setData({['info.costList['+index+'].'+key]:value});
  },
  // 选择计费方式
  billingTypeChange(e){
    let {value} = e.detail;
    this.setData({
      ['info.billingType']:this.data.billingTypeOrderList[value].codeValue,
      'billingTypeIndex':value,
    });
  },
  // 选择报价车型
  vehicleTypeQuoteChange(e){
    let {value} = e.detail;
    this.setData({
      ['info.quoteVehicleType']:this.data.vehicleTypeQuoteList[value].codeValue,
      'vehicleTypeQuoteIndex':value,
    });
  },
  // 短驳配送费用数量 - input赋值
  feeNumInput(e){
    let {value} = e.detail;
    let { index } = e.currentTarget.dataset;
    this.setData({['info.feeList['+index+'].num']:value});
  },
  // 选择出库单号popover
  showOutOrderMaterialPopover(){
    this.setData({isShowOutOrderMaterialPopover:true})
  },
  /**
   * 选择出库单号
   */
  selectOutOrderMaterial(e){
    let { item,index } = e.currentTarget.dataset;
    item.select = item.select?false:true;
    // 选择出库单号逻辑
    this.setData({ 
      outOrderMaterialSearch:'',
      ['outOrderMaterialList['+index+']']:item,
    });
  },
  /**
   * 确认选择出库单号
   */
  sureOutOrderMaterial(){
    let list = [];
    this.data.outOrderMaterialList.forEach(el => {
      if(el.select){
        list.push(el);
      }
      el.palletNums2 = el.palletNums2?el.palletNums2:el.palletNums;
    })
    this.setData({isShowOutOrderMaterialPopover:false,['info.list']:list})
  },
  // 查询出库单号
  searchOutOrderMaterialList(e){
    let value = e.detail.value;
    this.setData({ driverSearch: value });
    //延迟查询
    if (this.data.searchTimeout) clearTimeout(this.data.searchTimeout);
    this.data.searchTimeout = setTimeout(async () => {
      let supplierList = [];
      this.data.supplierListCache.forEach(el => {
        if(el.supplierName.indexOf(value)>-1){  
          supplierList.push(el);
        }
      })
      this.setData({supplierList});
      clearTimeout(this.data.searchTimeout);
    }, 300)
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
    let { item } = e.currentTarget.dataset;
    // 选择车辆逻辑
    this.setData({ 
      ['info.plateNumber']: item.plateNumber, 
      ['info.vehicleId']: item.vehicleId,
      ['info.vehicleType'] : item.vehicleType,
      ['info.vehicleTypeName'] : item.vehicleTypeName,
      ['info.vehicleLength'] : item.vehicleLength,
      ['info.vehicleLengthName'] : item.vehicleLengthName,
      isShowVehiclePopover:false 
    });
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
    let { item } = e.currentTarget.dataset;
    //选择司机逻辑
    this.setData({ 
      ['info.driverName']: item.driverName, 
      ['info.driverUserId']: item.driverUserId, 
      ['info.driverLinkPhone']: item.driverPhone, 
      isShowDriverPopover:false
    })
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

  // 选择供应商popover
  showSupplierPopover(e){
    let { index } = e.currentTarget.dataset;
    if(common.isNotBlank(index)){
      this.setData({currentCostIndex:index});
    }else{
      this.setData({currentCostIndex:undefined});
    }
    this.querySupplier();
    this.setData({isShowSupplierPopover:true})
  },
  /**
   * 选择供应商
   */
  selectSupplier(e){
    let { item } = e.currentTarget.dataset;
    //选择供应商逻辑
      let {currentCostIndex} = this.data;
    if(common.isBlank(currentCostIndex)){    
      // 基础信息选择供应商  
      this.setData({
        ["info.supplierTenantId"]: item.tenantId,
        ["info.supplierId"]: item.supplierId,
        ["info.supplierName"]: item.supplierName,
        supplierSearch:"",
        isShowSupplierPopover:false
      });
    }else{
      // 成本选择供应商  
      this.setData({
        ['info.costList['+currentCostIndex+'].tenantId']:item.tenantId,
        ['info.costList['+currentCostIndex+'].supplierName']:item.supplierName,
        supplierSearch:"",
        isShowSupplierPopover:false
      });
    }
  },
  // 查询供应商
  searchSupplierList(e){
    let value = e.detail.value;
    this.setData({ driverSearch: value });
    //延迟查询
    if (this.data.searchTimeout) clearTimeout(this.data.searchTimeout);
    this.data.searchTimeout = setTimeout(async () => {
      let supplierList = [];
      this.data.supplierListCache.forEach(el => {
        if(el.supplierName.indexOf(value)>-1){  
          supplierList.push(el);
        }
      })
      this.setData({supplierList});
      clearTimeout(this.data.searchTimeout);
    }, 300)
  },


  // 选择仓配项目popover
  showCostTypePopover(e){
    let { index } = e.currentTarget.dataset;
    this.setData({currentCostIndex:index});
    this.setData({isShowCostTypePopover:true})
  },
  /**
   * 选择仓配项目
   */
  selectCostType(e){
    let { item } = e.currentTarget.dataset;
    let {currentCostIndex} = this.data;
    // 选择仓配项目逻辑
    this.setData({ 
      ['info.costList['+currentCostIndex+'].itemName']:item.codeName,
      ['info.costList['+currentCostIndex+'].itemType']:item.codeValue,
      isShowCostTypePopover:false 
    });
  },
  // 查询仓配项目
  searchCostTypeList(e){
    let value = e.detail.value;
    this.setData({ vehicleSearch: value });
    //延迟查询
    if (this.data.searchTimeout) clearTimeout(this.data.searchTimeout);
    this.data.searchTimeout = setTimeout(async () => {
      let costTypeList = [];
      this.data.costTypeListCahce.forEach(el => {
        if(el.codeName.indexOf(value)>-1){  
          costTypeList.push(el);
        }
      })
      this.setData({costTypeList});
      clearTimeout(this.data.searchTimeout);
    }, 300)
  },
  
  // 配送时间
  changeDate(e){
    let value = e.detail;
    this.setData({['info.deliveryDate']:value});
  },
  // 是否往返
  changeReturn(e){
    let value = e.detail;
    this.setData({['info.isReturn']:value});
  },

  // 上一步
  toPre(e){
    this.setData({step:Number(e.currentTarget.dataset.step)-1});
  },
  // 下一步
  async toNext(e){
    let step = Number(e.currentTarget.dataset.step)
    let go = true;
    switch(step){
      case 1:
        if(this.data.info.list.length==0){
          wxApi.showToast("请选择出库单号");
          go = false;
          break;
        }
        let palletNumsIpt = true;
        this.data.info.list.forEach(el => {
          if(common.isBlank(el.palletNums2)){
            palletNumsIpt = false;
          }
        })
        if(!palletNumsIpt){
          wxApi.showToast("请输入配送托数");
          go = false;
          break;
        }
        // 判断是否多个作业点
        let workArr = []
        this.data.info.list.forEach(el => {
          if(!workArr.includes(el.workId)){
            workArr.push(el.workId);
          }
        })
        if(workArr.length>1){
          this.setData({billingTypeDisabled:true})
        }
        // 查费用列表
        this.queryFeeList();
        break;
      case 2:
        let {supplierName,plateNumber,driverName,quoteVehicleType,goodsCount,billingType} = this.data.info;
        if(common.isBlank(supplierName)){
          wxApi.showToast("请选择供应商");
          go = false;
          break;
        }
        if(common.isBlank(plateNumber)){
          wxApi.showToast("请选择车牌号码");
          go = false;
          break;
        }
        if(common.isBlank(driverName)){
          wxApi.showToast("请选择司机");
          go = false;
          break;
        }
        if(common.isBlank(quoteVehicleType)){
          wxApi.showToast("请选择报价车型");
          go = false;
          break;
        }
        if(common.isBlank(goodsCount) && billingType == 2){
          wxApi.showToast("请输入计费件数");
          go = false;
          break;
        }
        break;
      case 3:
        let feeNumsIpt = true;
        this.data.info.list.forEach(el => {
          if(common.isBlank(el.palletNums2)){
            feeNumsIpt = false;
          }
        })
        if(!feeNumsIpt){
          wxApi.showToast("请输入短驳配送费用数量");
          go = false;
          break;
        }
        break;
    }
    if(!go) return;
    step++;
    this.setData({step});
  },
  async submit(){
    await util.postByBeanName('wmsWaybillService','saveOrUpdateWmsWaybillInfoForWechat',this.data.info);
    await wxApi.showModal("新增成功")
    wx.navigateBack({
      delta: 1,
    })
  },
})