import {util,wxApi,common,regeneratorRuntime} from '../../../common/commonImport'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    info:{
      isFromMiniProgram:true,
      isReceipt:1,
      goodsList:[
        {}
      ],
      supplierList:[{}],
      workList:[],
      fee:{},
      incomeFee:{},
      costFee:{},
      planCompany:1,
      planCount:'',
      startDate:'',
      endDate:'',
      settleBody:'',
      thrdPlanNum:'',
    },
    step:1,
    // 静态数据列表
    orderTypeList:[],
    workTypeList:[],
    billingTypeOrderList:[],
    vehicleTypeQuoteList:[],
    vehicleLengthList:[],
    payModeList:[],
    companyData:[],
    settleBodyData:[],
    // 选择器索引
    billingTypeIndex:null,
    vehicleTypeQuoteIndex:null,
    vehicleLengthIndex:null,
    payModeIndex:null,
    planCompanyIndex:null,
    settleBodyIndex:null,
    // 收入费用索引
    incomeBillingTypeIndex:null,
    incomePayModeIndex:null,
    incomeQuoteVehicleIndex:null,
    incomeVehicleLengthIndex:null,
    // 成本费用索引
    costBillingTypeIndex:null,
    costQuoteVehicleIndex:null,
    costVehicleLengthIndex:null,
    // 列表数据
    customerList:[],
    customerListAll:[],
    customerSearch:'',
    routerList:[],
    routerListAll:[],
    routerSearch:'',
    supplierData:[],
    supplierDataAll:[],
    supplierSearch:'',
    currentSupplierIndex:0,
    routerHistoryList:[],
    goodList1:[],
    goodList2:[],
    goodList3:[],
    pickWorkList:[],
    dischargeWorkList:[],
    currentGoodIndex:0,
    custWorkData:[],
    currentWorkIndex:0,
    supplierData:[],
    // 提示框
    isShowCustomerPopover:false,
    isShowRouterPopover:false,
    isShowGoodsPopover:false,
    isShowWorkPopover:false,
    isShowSupplierPopover:false,
    // 计算合计
    goodsCountSum:0,
    goodsWeightSum:0,
    goodsVolumeSum:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.init();
    // 返回监听
    wx.enableAlertBeforeUnload({
      message:"是否返回调度列表？（填写信息将丢失）",
    })
  },

  /**
   * 初始化
   */
  async init() {
    //加载静态枚举
    let data = await util.postByBeanName('commonTF','getSysStaticDataByCodeTypes',{codeType:'PAY_TITLE,ORDER_TYPE,WORK_TYPE,WHETHER,PLAN_COMPANY,BILLING_TYPE_ORDER,VEHICLE_TYPE_QUOTE,VEHICLE_LENGTH,PAY_MODE'});
    this.setData({
      settleBodyData:data.PAY_TITLE || [],
      orderTypeList:data.ORDER_TYPE || [],
      workTypeList:data.WORK_TYPE || [],
      receiptData:data.WHETHER || [],
      companyData:data.PLAN_COMPANY || [],
      billingTypeOrderList:data.BILLING_TYPE_ORDER || [],
      vehicleTypeQuoteList:data.VEHICLE_TYPE_QUOTE || [],
      vehicleLengthList:data.VEHICLE_LENGTH || [],
      payModeList:data.PAY_MODE || [],
    })

    // 筛选结算方式只保留1和4
    let payModeList = this.data.payModeList.filter(item => item.codeValue == 1 || item.codeValue == 4);
    this.setData({payModeList});

    // 查询客户列表
    await this.queryCustomer();
    // 查询供应商列表
    await this.querySupplier();
    // 加载用户历史下单
    await this.queryRouterHistoryList();

    // 默认订单类型为整车
    if(this.data.orderTypeList.length > 0){
      this.setData({
        ["info.orderType"]: '1'
      });
    }
    // 默认计划单位
    if(this.data.companyData.length > 0){
      for(let item of this.data.companyData){
        if(item.codeValue == 1){
          this.setData({["info.planCompany"]: item.codeValue, planCompanyIndex: this.data.companyData.indexOf(item)});
          break;
        }
      }
    }
    // 默认是否回单
    if(this.data.receiptData.length > 0){
      for(let item of this.data.receiptData){
        if(item.codeValue == 0){
          this.setData({["info.isReceipt"]: item.codeValue});
          break;
        }
      }
    }
    // 默认计费方式
    if(this.data.billingTypeOrderList.length > 0){
      for(let item of this.data.billingTypeOrderList){
        if(item.codeValue == 1){
          this.setData({
            ["info.incomeFee.billingType"]: item.codeValue,
            incomeBillingTypeIndex: this.data.billingTypeOrderList.indexOf(item),
            ["info.costFee.billingType"]: item.codeValue,
            costBillingTypeIndex: this.data.billingTypeOrderList.indexOf(item)
          });
          break;
        }
      }
    }
    // 默认结算方式
    if(this.data.payModeList.length > 0){
      for(let item of this.data.payModeList){
        if(item.codeValue == 1){
          this.setData({
            ["info.incomeFee.payMode"]: item.codeValue,
            incomePayModeIndex: this.data.payModeList.indexOf(item)
          });
          break;
        }
      }
    }
  },
  // 查询静态数据
  async queryStaticData(){
    //静态枚举
    let {ORDER_TYPE,ORDER_STATE,WORK_TYPE,BILLING_TYPE_ORDER,VEHICLE_TYPE,VEHICLE_TYPE_QUOTE,VEHICLE_LENGTH,PAY_MODE,BIZ_TYPE} = await util.postByBeanName('commonTF','getSysStaticDataByCodeTypes',{codeType:"ORDER_TYPE,ORDER_STATE,WORK_TYPE,BILLING_TYPE_ORDER,VEHICLE_TYPE,VEHICLE_TYPE_QUOTE,VEHICLE_LENGTH,PAY_MODE,BIZ_TYPE"});
    this.setData({
      orderTypeList:ORDER_TYPE,   //订单类型(整车/整车-双程/零担)
      orderStateList:ORDER_STATE, //订单状态
      workTypeList:WORK_TYPE,     //作业类型（提/卸）
      billingTypeOrderList:BILLING_TYPE_ORDER,  //计费方式
      vehicleTypeList:VEHICLE_TYPE,             //车型
      vehicleTypeQuoteList:VEHICLE_TYPE_QUOTE,  //报价车型
      vehicleLengthList:VEHICLE_LENGTH,         //车长
      payModeList:PAY_MODE,                     //结算方式
      bizTypeList:BIZ_TYPE,                     //业务类型
    })
  },
  // 获取客户列表
  async queryCustomer(){
    let customerList = await util.postByBeanName('customerTF','loadCustomerList',{custName:this.data.customerSearch});
    this.setData({customerList, customerListAll: customerList});
  },
  // 获取供应商列表
  async querySupplier(){
    let supplierData = await util.postByBeanName('supplierTF','queryAllSupplierList',{});
    this.setData({supplierData, supplierDataAll: supplierData});
  },
  // 获取客户线路列表
  async queryRouterList(){
    let routerList = await util.postByBeanName('routeTF','loadRouteSelectByTenantId',{tenantId:this.data.info.tenantId});
    this.setData({routerList, routerListAll: routerList});
    if(routerList.length==0) wxApi.showModal("当前客户没有线路。")
  },
  // 加载用户历史下单
  async queryRouterHistoryList(){
    let routerHistoryList = await util.postByBeanName('orderTF','loadOrderHisListOrderByIdDesc');
    this.setData({routerHistoryList});
  },
  // 获取线路作业点列表
  async queryOpList(){
    let workList = await util.postByBeanName('routeTF','loadWorkByRouteId',{routeId:this.data.info.routeId});
    workList.forEach(item => {
      item.workType = item.workType + "";
    });
    // 只在第一次加载线路时设置作业点列表
    if(this.data.info.workList.length == 0){
      this.setData({['info.workList']:workList});
    }
  },
  // 获取客户货物列表
  async queryGoodList(){
    let goodList1 = await util.postByBeanName('routeTF','loadGoodsByRouteId',{routeId:this.data.info.routeId});//线路
    let goodList2 = await util.postByBeanName('workGoodsTF','queryGoodsDataByTenantId',{tenantId:this.data.info.tenantId,type:1});//常规
    let goodList3 = await util.postByBeanName('workGoodsTF','queryGoodsDataByTenantId',{tenantId:this.data.info.tenantId,type:2});//包装
    this.setData({goodList1,goodList2,goodList3});
  },
  // 获取客户作业点列表
  async queryCustomerWorkList(){
    let custWorkData = await util.postByBeanName('workGoodsTF','queryWorkDataSelect',{tenantId:this.data.info.tenantId,isLoadStoreHouse: 1});
    this.setData({custWorkData});
  },

  // 第一步 start
  // 客户列表 - popover
  showCustomerPopover(){
    this.queryCustomer();
    this.setData({isShowCustomerPopover:true})
  },
  /**
   * 选择客户
   */
  selectCustomer(e){
    let { item } = e.currentTarget.dataset;
    this.setData({
      ['info.customerName']: item.name,
      ['info.tenantId']: item.tenantId,
      ['info.routeName']: '',
      ['info.routeId']: '',
      ['info.workList']: [],
      isShowCustomerPopover:false
    })
    // 清空线路和作业点数据
    this.setData({
      goodList1:[],
      goodList2:[],
      goodList3:[],
      pickWorkList:[],
      dischargeWorkList:[],
    })
    this.queryRouterList();
    this.queryCustomerWorkList();
  },
  // 查询客户列表 - popver
  searchCustomerList(e){
    let value = e.detail.value;
    this.setData({ customerSearch: value });
    //延迟过滤
    if (this.data.searchTimeout) clearTimeout(this.data.searchTimeout);
    this.data.searchTimeout = setTimeout(() => {
      // 从完整列表中过滤
      let filteredList = this.data.customerListAll.filter(item => {
        if(!value) return true;
        let searchValue = value.toLowerCase();
        return (item.name && item.name.toLowerCase().includes(searchValue)) ||
               (item.tenantId && item.tenantId.toString().includes(searchValue));
      });
      this.setData({ customerList: filteredList });
      clearTimeout(this.data.searchTimeout);
    }, 300)
  },

  // 线路列表 - popover
  showRouterPopover(){
    if(!this.data.info.tenantId){
      wxApi.showToast("请先选择客户");
      return;
    }
    this.queryRouterList();
    this.setData({isShowRouterPopover:true})
  },
  /**
   * 选择线路
   */
  async selectRouter(e){
    let { item } = e.currentTarget.dataset;
    this.setData({
      ['info.routeName']: item.routeName,
      ['info.routeId']: item.routeId,
      isShowRouterPopover:false
    })
    // 根据线路回显订单类型
    // let routeInfo = await util.postByBeanName('routeTF','loadRouteById',{routeId:item.routeId});
    // if(routeInfo && routeInfo.routeInfo){
    //   let orderType = 1; // 默认整车
    //   if(routeInfo.routeInfo.orderType==1 && routeInfo.routeInfo.isReturn==1){
    //     orderType = 2; // 整车-双程
    //   }else if(routeInfo.routeInfo.orderType==2){
    //     orderType = 3; // 零担
    //   }
    //   this.setData({['info.orderType']: orderType});
    // }
    // 加载作业点
    await this.queryOpList();
    // 初始化提货点和卸货点列表
    this.initGoodsWork();
    // 加载货物列表
    await this.queryGoodList();
    // 清空已选择的货物信息（因为线路变了，货物需要重新选择）
    this.setData({
      ['info.goodsList']: [{}],
      goodsCountSum: 0,
      goodsWeightSum: 0,
      goodsVolumeSum: 0
    });
    // 初始化所有货物的提货点和卸货点（选择线路后默认选中第一个）
    this.initAllGoodsWork();
  },
  // 查询线路列表 - popver
  searchRouterList(e){
    let value = e.detail.value;
    this.setData({ routerSearch: value });
    //延迟过滤
    if (this.data.searchTimeout) clearTimeout(this.data.searchTimeout);
    this.data.searchTimeout = setTimeout(() => {
      // 从完整列表中过滤
      let filteredList = this.data.routerListAll.filter(item => {
        if(!value) return true;
        let searchValue = value.toLowerCase();
        return (item.routeName && item.routeName.toLowerCase().includes(searchValue)) ||
               (item.routeId && item.routeId.toString().includes(searchValue));
      });
      this.setData({ routerList: filteredList });
      clearTimeout(this.data.searchTimeout);
    }, 300)
  },

  // 选择历史记录
  async selectHis(e){
    let { item } = e.currentTarget.dataset;
    this.data.customerList.forEach(el=>{
      if(el.tenantId == item.tenantId){
        this.setData({
          ['info.customerName']: el.name,
          ['info.tenantId']: el.tenantId,
        })
      }
    })
    if(common.isBlank(this.data.info.tenantId)){
      wxApi.showModal("没查询到此记录的客户信息。")
      return;
    }
    await this.queryRouterList();
    this.data.routerList.forEach(el=>{
      if(el.routeId == item.routeId){
        this.setData({
          ['info.routeName']: el.routeName,
          ['info.routeId']: el.routeId,
          ['info.orderType']: el.orderType,
        })
      }
    })
    // 加载作业点和货物
    if(this.data.info.routeId){
      await this.queryOpList();
      await this.queryGoodList();
    }
  },
  // 第一步   end

  // 第二步 start
  // 显示作业点选择弹窗
  showWorkPopover(e){
    let { index } = e.currentTarget.dataset;
    this.setData({isShowWorkPopover:true, currentWorkIndex:index})
  },
  // 选择作业点
  selectWork(e){
    let { item } = e.currentTarget.dataset;
    let index = this.data.currentWorkIndex;
    // 深拷贝选中的作业点数据到workList
    let workData = {...item};
    this.setData({
      ['info.workList['+index+']']:workData,
      isShowWorkPopover:false
    });
    // 重新回显作业类型索引
    this.initWorkType();
    this.synchronizationWorkData();
  },
  // 作业类型变更
  workTypeChange(e){
    let {value} = e.detail;
    let { index } = e.currentTarget.dataset;
    this.setData({
      ["info.workList["+index+"].workType"]:this.data.workTypeList[value].codeValue,
      ["info.workList["+index+"].workTypeIndex"]:value
    });
    this.synchronizationWorkData();
  },
  /**
   * 作业点提卸货回显
   */
  initWorkType(){
    this.data.info.workList.forEach((el,idx) => {
      this.data.workTypeList.forEach((item,index)=>{
        if(item.codeValue == el.workType){
          this.setData({['info.workList['+idx+'].workTypeIndex']:index});
        }
      })
    })
    this.synchronizationWorkData();
  },
  // 是否加急，是否回单
  switchChange(e){
    let value = e.detail;
    let { key } = e.currentTarget.dataset;
    if(value){
      this.setData({['info.'+key]:1})
    }else{
      this.setData({['info.'+key]:0})
    }
  },
  // 订单类型
  orderTypeChange(e){
    this.setData({'info.orderType':e.detail});
  },
  // 同步提卸货 作业点集合
  synchronizationWorkData() {
    let pickWorkList = [];
    let dischargeWorkList = [];
    let workList = this.data.info.workList || [];
    for (let i = 0; i < workList.length; i++) {
      let workType = parseInt(workList[i].workType);
      if (workType == 1 || workType == 3) {
        pickWorkList.push(workList[i]);
      }
      if (workType == 2 || workType == 3) {
        dischargeWorkList.push(workList[i]);
      }
    }
    this.setData({pickWorkList, dischargeWorkList});
  },
  // 添加作业点
  addWork() {
    if(!this.data.info.tenantId){
      wxApi.showToast("请先选择客户");
      return;
    }
    let workList = this.data.info.workList || [];
    workList.splice(1, 0, {workType: '3'});
    this.setData({['info.workList']: workList});
    this.synchronizationWorkData();
  },
  // 删除作业点
  delWork(e) {
    let index = e.currentTarget.dataset.index;
    let workList = this.data.info.workList || [];
    workList.splice(index, 1);
    this.setData({['info.workList']: workList});
    this.synchronizationWorkData();
    // 删除作业点后清空对应货物已选该作业点
    let goodsList = this.data.info.goodsList || [];
    for(let i=0; i<goodsList.length; i++){
      let flag = true;
      // 提货点
      for(let j=0; j<this.data.pickWorkList.length; j++){
        if(goodsList[i].beginWorkId == this.data.pickWorkList[j].workId){
          flag = false;
          break;
        }
      }
      if(flag){
        this.setData({['info.goodsList['+i+'].beginWorkId']: ''});
      }
      // 卸货点
      flag = true;
      for(let j=0; j<this.data.dischargeWorkList.length; j++){
        if(goodsList[i].endWorkId == this.data.dischargeWorkList[j].workId){
          flag = false;
          break;
        }
      }
      if(flag){
        this.setData({['info.goodsList['+i+'].endWorkId']: ''});
      }
    }
  },
  // 输入赋值 - 作业点列表
  inputSetDataWorkList(e){
    let {value} = e.detail;
    let { key,index } = e.currentTarget.dataset;
    this.setData({['info.workList['+index+'].'+key]:value});
  },
  // 第二步  end

  // 第三步  start

  // 货物列表 - popover
  showGoodsPopover(e){
    let { index } = e.currentTarget.dataset;
    this.setData({isShowGoodsPopover:true,currentGoodIndex:index})
  },
  /**
   * 选择货物
   */
  selectGoods(e){
    let { item } = e.currentTarget.dataset;
    let index = this.data.currentGoodIndex;
    this.setData({
      ['info.goodsList['+index+'].goodsName']: item.goodsName,
      ['info.goodsList['+index+'].goodsId']: item.goodsId,
      ['info.goodsList['+index+'].className']: item.className,
      ['info.goodsList['+index+'].classId']: item.classId,
      ['info.goodsList['+index+'].goodsModel']: item.goodsModel,
      ['info.goodsList['+index+'].packingType']: item.packingType,
      ['info.goodsList['+index+'].packingTypeName']: item.packingTypeName,
      ['info.goodsList['+index+'].singleGoodsVolume']: item.singleGoodsVolume,
      isShowGoodsPopover:false
    });
    // 如果有单件体积且有件数，自动计算总体积
    let goodsList = this.data.info.goodsList;
    if(item.singleGoodsVolume && goodsList[index].goodsCount){
      goodsList[index].goodsVolume = common.accMul(goodsList[index].goodsCount, item.singleGoodsVolume);
      this.setData({
        ['info.goodsList['+index+'].goodsVolume']: goodsList[index].goodsVolume
      });
    }
    this.synchronizationGoodsSum();
  },
  // 输入赋值
  inputSetDataGoodsList(e){
    let {value} = e.detail;
    let { key,index } = e.currentTarget.dataset;
    this.setData({['info.goodsList['+index+'].'+key]:value});
    if(key == 'goodsCount' || key == 'goodsWeight' || key == 'goodsVolume'){
      // 如果是修改件数，且有单件体积，自动计算总体积
      if(key == 'goodsCount' && this.data.info.goodsList[index].singleGoodsVolume){
        let goodsVolume = common.accMul(value, this.data.info.goodsList[index].singleGoodsVolume);
        this.setData({['info.goodsList['+index+'].goodsVolume']: goodsVolume});
      }
      this.synchronizationGoodsSum();
    }
  },
  // 初始化提货、卸货选择列表
  initGoodsWork(){
    let pickWorkList = [],dischargeWorkList=[];
    let workList = this.data.info.workList || [];
    workList.forEach(el=>{
      let workType = parseInt(el.workType);
      if(workType==1||workType==3){
        pickWorkList.push(el);
      }
      if(workType==2||workType==3){
        dischargeWorkList.push(el);
      }
    })
    this.setData({pickWorkList,dischargeWorkList});
    this.setGoodWork();
  },
  // 回显提货、卸货点
  setGoodWork(){
    let {pickWorkList,dischargeWorkList} = this.data;
    // 默认选择第一个提货点和卸货点
    let index = this.data.info.goodsList.length-1;
    if(pickWorkList.length > 0){
      this.setData({
        ['info.goodsList['+index+'].beginWorkId']:pickWorkList[0].workId,
        ['info.goodsList['+index+'].pickWorkIndex']:0,
      });
    }
    if(dischargeWorkList.length > 0){
      this.setData({
        ['info.goodsList['+index+'].endWorkId']:dischargeWorkList[0].workId,
        ['info.goodsList['+index+'].dischargeWorkIndex']:0,
      });
    }
  },
  // 初始化所有货物的提货点和卸货点（用于选择线路后）
  initAllGoodsWork(){
    let goodsList = this.data.info.goodsList || [];
    if(goodsList.length == 0) return;

    let {pickWorkList,dischargeWorkList} = this.data;
    goodsList.forEach((item, index) => {
      // 默认选择第一个提货点
      if(pickWorkList.length > 0 && !item.beginWorkId){
        this.setData({
          ['info.goodsList['+index+'].beginWorkId']:pickWorkList[0].workId,
          ['info.goodsList['+index+'].pickWorkIndex']:0,
        });
      }
      // 默认选择第一个卸货点
      if(dischargeWorkList.length > 0 && !item.endWorkId){
        this.setData({
          ['info.goodsList['+index+'].endWorkId']:dischargeWorkList[0].workId,
          ['info.goodsList['+index+'].dischargeWorkIndex']:0,
        });
      }
    });
  },
  // 提货选择
  pickWorkChange(e){
    let {value} = e.detail;
    let { index } = e.currentTarget.dataset;
    this.setData({
      ['info.goodsList['+index+'].beginWorkId']:this.data.pickWorkList[value].workId,
      ['info.goodsList['+index+'].pickWorkIndex']:value,
    });
  },
  // 卸货选择
  dischargeWorkChange(e){
    let {value} = e.detail;
    let { index } = e.currentTarget.dataset;
    this.setData({
      ['info.goodsList['+index+'].endWorkId']:this.data.dischargeWorkList[value].workId,
      ['info.goodsList['+index+'].dischargeWorkIndex']:value,
    });
  },
  // 添加货物
  addGood(){
    this.data.info.goodsList.push({});
    this.setData({['info.goodsList']:this.data.info.goodsList});
    this.setGoodWork();
  },
  //删除最后一个货物
  delGood(){
    this.data.info.goodsList.pop();
    this.setData({['info.goodsList']:this.data.info.goodsList})
    this.synchronizationGoodsSum();
  },
  // 添加供应商
  addSupplier(){
    let supplier = {};
    this.data.info.supplierList.push(supplier);
    this.setData({['info.supplierList']:this.data.info.supplierList})
  },
  // 删除最后一个供应商
  delSupplier(){
    this.data.info.supplierList.pop();
    this.setData({['info.supplierList']:this.data.info.supplierList})
  },
  // 供应商列表 - popover
  showSupplierPopover(e){
    let { index } = e.currentTarget.dataset;
    this.setData({isShowSupplierPopover:true, currentSupplierIndex:index})
  },
  /**
   * 选择供应商
   */
  selectSupplier(e){
    let { item } = e.currentTarget.dataset;
    let index = this.data.currentSupplierIndex;
    this.setData({
      ['info.supplierList['+index+'].tenantId']: item.tenantId,
      ['info.supplierList['+index+'].supplierName']: item.supplierName,
      isShowSupplierPopover:false
    })
  },
  // 查询供应商列表 - popver
  searchSupplierList(e){
    let value = e.detail.value;
    this.setData({ supplierSearch: value });
    //延迟过滤
    if (this.data.searchTimeout) clearTimeout(this.data.searchTimeout);
    this.data.searchTimeout = setTimeout(() => {
      // 从完整列表中过滤
      let filteredList = this.data.supplierDataAll.filter(item => {
        if(!value) return true;
        let searchValue = value.toLowerCase();
        return (item.supplierName && item.supplierName.toLowerCase().includes(searchValue)) ||
               (item.tenantId && item.tenantId.toString().includes(searchValue));
      });
      this.setData({ supplierData: filteredList });
      clearTimeout(this.data.searchTimeout);
    }, 300)
  },
  // 同步货物合计
  synchronizationGoodsSum() {
    let goodsCountSum = 0;
    let goodsWeightSum = 0;
    let goodsVolumeSum = 0;
    let goodsList = this.data.info.goodsList || [];
    for (let i = 0; i < goodsList.length; i++) {
      if (common.isNotBlank(goodsList[i].goodsCount)) {
        goodsCountSum = this.accAdd(goodsCountSum, Number(goodsList[i].goodsCount));
      }
      if (common.isNotBlank(goodsList[i].goodsWeight)) {
        goodsWeightSum = this.accAdd(goodsWeightSum, Number(goodsList[i].goodsWeight));
      }
      if (common.isNotBlank(goodsList[i].goodsVolume)) {
        goodsVolumeSum = this.accAdd(goodsVolumeSum, Number(goodsList[i].goodsVolume));
      }
    }
    this.setData({
      goodsCountSum,
      goodsWeightSum,
      goodsVolumeSum,
      ['info.fee.goodsCountSum']:goodsCountSum,
      ['info.fee.goodsVolumeSum']:goodsVolumeSum,
      ['info.fee.goodsWeightSum']:goodsWeightSum,
    });
  },
  // 加法运算(解决浮点数精度问题)
  accAdd(arg1, arg2) {
    let r1, r2, m;
    try {
      r1 = arg1.toString().split(".")[1].length;
    } catch (e) {
      r1 = 0;
    }
    try {
      r2 = arg2.toString().split(".")[1].length;
    } catch (e) {
      r2 = 0;
    }
    m = Math.pow(10, Math.max(r1, r2));
    return (arg1 * m + arg2 * m) / m;
  },
  // 第三步  end

  // 第四步  start

  // 收入费用 - 选择计费方式
  incomeBillingTypeChange(e){
    let {value} = e.detail;
    this.setData({
      ['info.incomeFee.billingType']:this.data.billingTypeOrderList[value].codeValue,
      'incomeBillingTypeIndex':value,
    });
    this.matchOrderFee();
  },
  // 收入费用 - 选择保价车型
  incomeQuoteVehicleChange(e){
    let {value} = e.detail;
    this.setData({
      ['info.incomeFee.quoteVehicleType']:this.data.vehicleTypeQuoteList[value].codeValue,
      'incomeQuoteVehicleIndex':value,
    });
    this.matchOrderFee();
  },
  // 收入费用 - 选择车长
  incomeVehicleLengthChange(e){
    let {value} = e.detail;
    this.setData({
      ['info.incomeFee.vehicleLength']:this.data.vehicleLengthList[value].codeValue,
      'incomeVehicleLengthIndex':value,
    });
    this.matchOrderFee();
  },
  // 收入费用 - 选择结算方式
  incomePayModeChange(e){
    let {value} = e.detail;
    this.setData({
      ['info.incomeFee.payMode']:this.data.payModeList[value].codeValue,
      'incomePayModeIndex':value,
    });
  },
  // 成本费用 - 选择计费方式
  costBillingTypeChange(e){
    let {value} = e.detail;
    this.setData({
      ['info.costFee.billingType']:this.data.billingTypeOrderList[value].codeValue,
      'costBillingTypeIndex':value,
    });
  },
  // 成本费用 - 选择保价车型
  costQuoteVehicleChange(e){
    let {value} = e.detail;
    this.setData({
      ['info.costFee.quoteVehicleType']:this.data.vehicleTypeQuoteList[value].codeValue,
      'costQuoteVehicleIndex':value,
    });
  },
  // 成本费用 - 选择车长
  costVehicleLengthChange(e){
    let {value} = e.detail;
    this.setData({
      ['info.costFee.vehicleLength']:this.data.vehicleLengthList[value].codeValue,
      'costVehicleLengthIndex':value,
    });
  },
  // 收入费用输入
  inputSetDataIncomeFee(e){
    let {value} = e.detail;
    let { key } = e.currentTarget.dataset;
    this.setData({['info.incomeFee.'+key]:value});
    if(key == 'pointFee'){
      this.changeIncomePointFee();
    } else {
      this.calcIncomeTotalFee();
    }
  },
  // 成本费用输入
  inputSetDataCostFee(e){
    let {value} = e.detail;
    let { key } = e.currentTarget.dataset;
    this.setData({['info.costFee.'+key]:value});
    if(key == 'pointFee'){
      this.changeCostPointFee();
    } else {
      this.calcCostTotalFee();
    }
  },
  // 收入点位费变更
  changeIncomePointFee: function (){
    let pointFee = this.data.info.incomeFee.pointFee || "0";
    pointFee = isNaN(parseFloat(pointFee)) ? "0" : pointFee;
    let totalPointFee = common.accMul(pointFee, this.data.info.workList.length - 2);
    this.setData({['info.incomeFee.totalPointFee']: totalPointFee});
    this.calcIncomeTotalFee();
  },
  // 成本点位费变更
  changeCostPointFee: function (){
    let pointFee = this.data.info.costFee.pointFee || "0";
    pointFee = isNaN(parseFloat(pointFee)) ? "0" : pointFee;
    let totalPointFee = common.accMul(pointFee, this.data.info.workList.length - 2);
    this.setData({['info.costFee.totalPointFee']: totalPointFee});
    this.calcCostTotalFee();
  },
  // 计算收入费用合计
  calcIncomeTotalFee() {
    let fee = this.data.info.incomeFee || {};
    let totalFee = 0;

    // 运费
    let freight = Number(fee.freight) || 0;
    totalFee = this.accAdd(totalFee, freight);

    // 点位费合计
    let totalPointFee = Number(fee.totalPointFee) || 0;
    totalFee = this.accAdd(totalFee, totalPointFee);

    // 提货费
    let pickupFee = Number(fee.pickupFee) || 0;
    totalFee = this.accAdd(totalFee, pickupFee);

    // 送货费
    let deliveryFee = Number(fee.deliveryFee) || 0;
    totalFee = this.accAdd(totalFee, deliveryFee);

    this.setData({
      ['info.incomeFee.totalFee']: totalFee
    });
  },
  // 计算成本费用合计
  calcCostTotalFee() {
    let fee = this.data.info.costFee || {};
    let totalFee = 0;

    // 运费
    let freight = Number(fee.freight) || 0;
    totalFee = this.accAdd(totalFee, freight);

    // 点位费合计
    let totalPointFee = Number(fee.totalPointFee) || 0;
    totalFee = this.accAdd(totalFee, totalPointFee);

    // 提货费
    let pickupFee = Number(fee.pickupFee) || 0;
    totalFee = this.accAdd(totalFee, pickupFee);

    // 送货费
    let deliveryFee = Number(fee.deliveryFee) || 0;
    totalFee = this.accAdd(totalFee, deliveryFee);

    this.setData({
      ['info.costFee.totalFee']: totalFee
    });
  },
  // 选择结算主体
  settleBodyChange(e){
    let {value} = e.detail;
    this.setData({
      ['info.settleBody']:this.data.settleBodyData[value].codeValue,
      'settleBodyIndex':value,
    });
  },
  // 选择计划单位
  planCompanyChange(e){
    let {value} = e.detail;
    this.setData({
      ['info.planCompany']:this.data.companyData[value].codeValue,
      'planCompanyIndex':value,
    });
  },
  // 初始化费用
  initFeeData(){
    let goodsCountSum = 0,goodsVolumeSum = 0,goodsWeightSum = 0;
    this.data.info.goodsList.forEach(el => {
      goodsCountSum += Number(el.goodsCount);
      goodsVolumeSum += Number(el.goodsVolume);
      goodsWeightSum += Number(el.goodsWeight);
    });
    this.setData({
      ['info.fee.goodsCountSum']:goodsCountSum,
      ['info.fee.goodsVolumeSum']:goodsVolumeSum,
      ['info.fee.goodsWeightSum']:goodsWeightSum,
    })
  },
  // 计费
  async matchOrderFee(){
    let {tenantId,orderType,workList,netWeight,grossWeight,volume} = this.data.info;
    let incomeFee = this.data.info.incomeFee || {};
    let {billingType,quoteVehicleType,vehicleLength} = incomeFee;
    if(common.isBlank(billingType)){
      return;
    }
    // 不传tenantId、orderType、billingType不匹配报价
    if(common.isNotBlank(tenantId)&&common.isNotBlank(orderType)&&common.isNotBlank(billingType)){
      let res = await util.postByBeanName('ZCQuoteNewTF','matchMiniProgramOrderFee',{
        tenantId,
        orderType,
        billingType,
        workList: workList || [],
        quoteVehicleType,
        vehicleLength,
        volume: volume || 0,
        netWeight: netWeight || 0,
        grossWeight: grossWeight || 0
      });
      // 更新收入费用
      Object.assign(incomeFee,res);
      this.setData({['info.incomeFee']:incomeFee});
      this.calcIncomeTotalFee();
    }
  },

  // 第四步  end

  //原生 - input赋值
  inputSetDataDefault(e){
    let {value} = e.detail;
    let { key } = e.currentTarget.dataset;
    this.setData({['info.'+key]:value});
  },
  // 日期赋值
  inputSetDataDate(e){
    let value = e.detail.value;
    let { key } = e.currentTarget.dataset;
    this.setData({['info.'+key]:value});
  },
  // 上一步
  toPre(e){
    this.setData({step:Number(e.currentTarget.dataset.step)-1});
  },
  // 下一步
  async toNext(e){
    let step = Number(e.currentTarget.dataset.step)
    switch(step){
      case 1:   //客户 - 线路
        if(!this.data.info.tenantId){
          wxApi.showModal("请选择客户。")
          return;
        }
        if(!this.data.info.routeId){
          wxApi.showModal("请选择线路。")
          return;
        }
        if(!this.data.info.startDate){
          wxApi.showModal("请选择起始日期。")
          return;
        }
        if(!this.data.info.endDate){
          wxApi.showModal("请选择结束日期。")
          return;
        }
        if(this.data.info.startDate > this.data.info.endDate){
          wxApi.showModal("起始日期不能大于结束日期。")
          return;
        }
        if(!this.data.info.planCompany){
          wxApi.showModal("请选择计划单位。")
          return;
        }
        if(!this.data.info.planCount){
          wxApi.showModal("请输入计划数。")
          return;
        }
        if(!this.data.info.isReceipt && this.data.info.isReceipt !== 0){
          // 如果没有设置isReceipt，设置默认值
          this.setData({["info.isReceipt"]: 1});
        }
        await this.queryOpList();
        this.initWorkType();
        break;
      case 2:    //基础信息
        if(!this.data.info.orderType){
          wxApi.showModal("请选择订单类型。")
          return;
        }
        if(!this.data.info.isReceipt && this.data.info.isReceipt !== 0){
          wxApi.showModal("请选择是否回单。")
          return;
        }
        break;
      case 3:    //单趟收入计费明细
        await this.matchOrderFee();
        break;
      case 4:    //单趟成本计费明细
        break;
      case 5:
        if(!this.validateGoods()){
          return;
        }
        this.initFeeData();
        break;
      case 6:
        // 校验供应商信息
        if(!this.data.info.supplierList || this.data.info.supplierList.length == 0){
          wxApi.showModal("请至少添加一个供应商。")
          return;
        }
        for(let i=0; i<this.data.info.supplierList.length; i++){
          if(!this.data.info.supplierList[i].tenantId){
            wxApi.showModal("请选择第"+(i+1)+"个供应商。")
            return;
          }
        }
        break;
    }
    step++;
    this.setData({step});
  },

  // 校验货物信息
  validateGoods(){
    let goodsList = this.data.info.goodsList || [];
    if(goodsList.length == 0){
      wxApi.showModal("请至少添加一条货物信息。")
      return false;
    }
    let goodsBeginEndMap = new Map();
    for(let i = 0; i < goodsList.length; i++){
      let goodsId = goodsList[i].goodsId;
      let beginWorkId = goodsList[i].beginWorkId;
      let endWorkId = goodsList[i].endWorkId;
      if(!goodsId){
        wxApi.showModal("请选择第"+(i+1)+"个货物信息。")
        return false;
      }
      if(!beginWorkId){
        wxApi.showModal("请选择第"+(i+1)+"个货物的提货点。")
        return false;
      }
      if(!endWorkId){
        wxApi.showModal("请选择第"+(i+1)+"个货物的卸货点。")
        return false;
      }
      let goodsCount = goodsList[i].goodsCount;
      let goodsWeight = goodsList[i].goodsWeight;
      let goodsVolume = goodsList[i].goodsVolume;
      if(!goodsCount && !goodsWeight && !goodsVolume){
        wxApi.showModal("第"+(i+1)+"个货物的件数、重量、体积必须填写一个有效数值。")
        return false;
      }
      // 校验货物重复
      let j = goodsBeginEndMap.get("" + goodsId + beginWorkId + endWorkId);
      if(j){
        wxApi.showModal("第"+j+"个货物和第"+(i+1)+"个货物的货物、提货点和卸货点相同，请重新选择。")
        return false;
      }
      goodsBeginEndMap.set("" + goodsId + beginWorkId + endWorkId, i + 1);
    }
    //校验货物信息与订单包单位是否匹配
    if((this.data.info.planCompany == '2' && this.data.goodsWeightSum == 0) ||
      (this.data.info.planCompany == '3' && this.data.goodsVolumeSum == 0) ||
      (this.data.info.planCompany == '4' && this.data.goodsCountSum == 0)){
      wxApi.showModal("请输入与订单包单位相符的货物信息。")
      return false;
    }
    return true;
  },

  // 提交
  async submit(){
    //基本信息校验
    if(!this.data.info.tenantId){
      wxApi.showModal("请选择客户。")
      return;
    }
    if(!this.data.info.routeId){
      wxApi.showModal("请选择线路。")
      return;
    }
    if(!this.data.info.orderType){
      wxApi.showModal("请选择订单类型。")
      return;
    }
    if(!this.data.info.isReceipt && this.data.info.isReceipt !== 0){
      wxApi.showModal("请选择是否回单。")
      return;
    }
    if(!this.data.info.startDate){
      wxApi.showModal("请选择起始日期。")
      return;
    }
    if(!this.data.info.endDate){
      wxApi.showModal("请选择结束日期。")
      return;
    }
    if(this.data.info.startDate > this.data.info.endDate){
      wxApi.showModal("起始日期不能大于结束日期。")
      return;
    }
    if(!this.data.info.planCompany){
      wxApi.showModal("请选择订单包单位。")
      return;
    }
    if(!this.data.info.planCount){
      wxApi.showModal("请输入订单包数。")
      return;
    }

    //零担订单只能有提卸货点
    if(this.data.info.orderType == '3' && this.data.info.workList.length != 2){
      wxApi.showModal("零担订单包只能有提卸货点。")
      return;
    }

    //作业点信息校验
    let workList = this.data.info.workList || [];
    if(workList.length < 2){
      wxApi.showModal("请至少保留一个起点和一个终点。")
      return;
    }
    for(let i = 0; i < workList.length; i++){
      if(!workList[i].workId){
        wxApi.showModal("请选择第"+(i+1)+"行作业点名称。")
        return;
      }
      if(!workList[i].workType){
        wxApi.showModal("请选择第"+(i+1)+"行作业内容。")
        return;
      }
      if(!workList[i].workAddressStr){
        wxApi.showModal("请输入第"+(i+1)+"行作业点详细地址。")
        return;
      }
      if(i == 0 && workList[i].workType != '1'){
        wxApi.showModal("起点作业内容只能为提货。")
        return;
      }
      if(i == workList.length - 1 && workList[i].workType != '2'){
        wxApi.showModal("终点作业内容只能为卸货。")
        return;
      }
    }

    //收入费用信息校验
    if(!this.data.info.incomeFee.billingType){
      wxApi.showModal("请选择收入计费方式。")
      return;
    }
    if(!this.data.info.incomeFee.payMode){
      wxApi.showModal("请选择收入结算方式。")
      return;
    }

    //成本费用信息校验
    if(!this.data.info.costFee.billingType){
      wxApi.showModal("请选择成本计费方式。")
      return;
    }

    //货物信息校验
    if(!this.data.info.goodsList || this.data.info.goodsList.length < 1){
      wxApi.showModal("请填写至少一条订单货物。")
      return;
    }
    let goodsBeginEndMap = new Map();
    for(let i = 0; i < this.data.info.goodsList.length; i++){
      let goodsId = this.data.info.goodsList[i].goodsId;
      let beginWorkId = this.data.info.goodsList[i].beginWorkId;
      let endWorkId = this.data.info.goodsList[i].endWorkId;
      if(!goodsId){
        wxApi.showModal("请选择第"+(i+1)+"个货物信息。")
        return;
      }
      if(!beginWorkId){
        wxApi.showModal("请选择第"+(i+1)+"个货物的提货点。")
        return;
      }
      if(!endWorkId){
        wxApi.showModal("请选择第"+(i+1)+"个货物的卸货点。")
        return;
      }
      let goodsCount = this.data.info.goodsList[i].goodsCount;
      let goodsWeight = this.data.info.goodsList[i].goodsWeight;
      let goodsVolume = this.data.info.goodsList[i].goodsVolume;
      if(!goodsCount && !goodsWeight && !goodsVolume){
        wxApi.showModal("第"+(i+1)+"个货物的件数、重量、体积必须填写一个有效数值。")
        return;
      }
      let j = goodsBeginEndMap.get("" + goodsId + beginWorkId + endWorkId);
      if(j){
        wxApi.showModal("第"+j+"个货物和第"+(i+1)+"个货物的货物、提货点和卸货点相同，请重新选择。")
        return;
      }
      goodsBeginEndMap.set("" + goodsId + beginWorkId + endWorkId, i + 1);
    }

    //校验货物信息与订单包单位是否匹配
    if((this.data.info.planCompany == '2' && this.data.goodsWeightSum == 0) ||
      (this.data.info.planCompany == '3' && this.data.goodsVolumeSum == 0) ||
      (this.data.info.planCompany == '4' && this.data.goodsCountSum == 0)){
      wxApi.showModal("请输入与订单包单位相符的货物信息。")
      return;
    }

    //供应商/司机/车辆信息校验
    let supplierList = this.data.info.supplierList || [];
    if(supplierList.length == 0){
      wxApi.showModal("请选择供应商/司机/车辆信息信息。")
      return;
    }
    for(let i = 0; i < supplierList.length; i++){
      if(!supplierList[i].tenantId){
        wxApi.showModal("请选择第"+(i+1)+"行供应商。")
        return;
      }
    }

    // 构造提交数据
    let param = {};
    let orderPlan = {...this.data.info};
    orderPlan.orderCustId = orderPlan.tenantId;
    orderPlan.goodsCountSum = this.data.goodsCountSum;
    orderPlan.goodsWeightSum = this.data.goodsWeightSum;
    orderPlan.goodsVolumeSum = this.data.goodsVolumeSum;
    param.orderPlan = orderPlan;
    param.workData = this.data.info.workList;
    param.incomeFee = this.data.info.incomeFee;
    param.costFee = this.data.info.costFee;
    param.goodsData = this.data.info.goodsList;
    param.tenantDriverVehicleData = this.data.info.supplierList;

    //保存订单计划
    await util.postByBeanName('ordPlanTF','saveOrdPlanInfo',param);
    await wxApi.showModal("保存成功。")
    wx.disableAlertBeforeUnload();
    wx.navigateBack({
      delta: 1,
    })
  }
})