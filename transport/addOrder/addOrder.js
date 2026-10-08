import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    info:{
      isFromMiniProgram:true,
      isUrgent:0,
      haveReceipt:1,
      goodsList:[
        {}
      ]
    },
    step:1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.queryStaticData();
    this.queryCustomer();
    this.queryRouterHistoryList();
    // 返回监听
    wx.enableAlertBeforeUnload({
      message:"是否返回调度列表？（填写信息将丢失）",
    })
  },
  // 查询静态数据
  async queryStaticData(){
    //静态枚举
    let {ORDER_TYPE,ORDER_STATE,WORK_TYPE,GOODS_CLASS_TYPE,GOODS_PACKING_TYPE,BILLING_TYPE_ORDER,VEHICLE_TYPE,VEHICLE_TYPE_QUOTE,VEHICLE_LENGTH,PAY_MODE,BIZ_TYPE} = await util.postByBeanName('commonTF','getSysStaticDataByCodeTypes',{codeType:"ORDER_TYPE,ORDER_STATE,WORK_TYPE,GOODS_CLASS_TYPE,GOODS_PACKING_TYPE,BILLING_TYPE_ORDER,VEHICLE_TYPE,VEHICLE_TYPE_QUOTE,VEHICLE_LENGTH,PAY_MODE,BIZ_TYPE"});
    this.setData({
      orderTypeList:ORDER_TYPE,   //订单类型(整车/整车-双程/零担) 
      orderStateList:ORDER_STATE, //订单状态
      workTypeList:WORK_TYPE,     //作业类型（提/卸）
      goodsClassTypeList:GOODS_CLASS_TYPE,      //货物类别
      goodsPackingTypeList:GOODS_PACKING_TYPE,  //货物包装
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
    this.setData({customerList,customerListCache:customerList});
  },
  // 获取客户线路列表
  async queryRouterList(){
    let routerList = await util.postByBeanName('routeTF','loadRouteSelectByTenantId',{tenantId:this.data.info.tenantId});
    this.setData({routerList,routerListCache:routerList});
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
    this.setData({['info.workList']:workList});
  },
  // 获取客户货物列表
  async queryGoodList(){
    let goodList1 = await util.postByBeanName('routeTF','loadGoodsByRouteId',{routeId:this.data.info.routeId});//线路
    let goodList2 = await util.postByBeanName('workGoodsTF','queryGoodsDataByTenantId',{tenantId:this.data.info.tenantId,type:1});//常规
    let goodList3 = await util.postByBeanName('workGoodsTF','queryGoodsDataByTenantId',{tenantId:this.data.info.tenantId,type:2});//包装
    this.setData({goodList1,goodList2,goodList3});
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
      isShowCustomerPopover:false
    })
    this.queryRouterList();
  },
  // 查询客户列表 - popver
  searchCustomerList(e){
    let value = e.detail.value;
    this.setData({ customerSearch: value });
    //延迟查询
    if (this.data.searchTimeout) clearTimeout(this.data.searchTimeout);
    this.data.searchTimeout = setTimeout(() => {
      let customerList = [];
      this.data.customerListCache.forEach(item => {
        if(item.name.indexOf(this.data.customerSearch) > -1){
          customerList.push(item);
        }
      })
      this.setData({customerList})
      clearTimeout(this.data.searchTimeout);
    }, 300)
  },
  
  // 线路列表 - popover
  showRouterPopover(){
    if(!this.data.info.tenantId){
      wxApi.showToast("请先选择客户。")
      return
    }
    this.queryRouterList();
    this.setData({isShowRouterPopover:true})
  },
  /**
   * 选择线路
   */
  selectRouter(e){
    let { item } = e.currentTarget.dataset;
    this.setData({ 
      ['info.routeName']: item.routeName, 
      ['info.routeId']: item.routeId,
      isShowRouterPopover:false
    })
  },
  // 查询线路列表 - popver
  searchRouterList(e){
    let value = e.detail.value;
    this.setData({ routerSearch: value });
    //延迟查询
    if (this.data.searchTimeout) clearTimeout(this.data.searchTimeout);
    this.data.searchTimeout = setTimeout(async () => {
      let routerList = [];
      this.data.routerListCache.forEach(item => {
        if(item.routeName.indexOf(this.data.routerSearch) > -1){
          routerList.push(item);
        }
      })
      this.setData({routerList})
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
  },
  /**
   * 选择业务类型
   */
  bizTypeChange(e){
    let { value } = e.detail;
    let item = this.data.bizTypeList[value];
    this.setData({
      ["info.bizType"]: item.codeValue,
      bizTypeIndex: value
    });
  },
  // 第一步   end

  // 第二步 start
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
  },
  // 作业点要求时间
  changeDate(e){
    let value = e.detail;
    let { index } = e.currentTarget.dataset;
    this.setData({['info.workList['+index+'].workDate']:value});
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
      isShowGoodsPopover:false
    });
    // 回显货物类别
    this.data.goodsClassTypeList.forEach((el,idx)=>{
      if(el.codeValue==item.classId){
        this.setData({['info.goodsList['+index+'].goodsClassIndex']: idx})
      }
    })
    // 回显货物包装
    this.data.goodsPackingTypeList.forEach((el,idx)=>{
      if(el.codeValue==item.packingType){
        this.setData({['info.goodsList['+index+'].packingTypeIndex']: idx})
      }
    })
  },
  // 货物类别选择
  goodsClassChange(e){
    let { value } = e.detail;
    let { index } = e.currentTarget.dataset;
    let item = this.data.goodsClassTypeList[value];
    this.setData({
      ["info.goodsList["+index+"].classId"]: item.codeValue,
      ["info.goodsList["+index+"].goodsClassIndex"]: value
    });
  },
  // 货物包装选择
  packingTypeChange(e){
    let { value } = e.detail;
    let { index } = e.currentTarget.dataset;
    let item = this.data.goodsPackingTypeList[value];
    this.setData({
      ["info.goodsList["+index+"].packingType"]: item.codeValue,
      ["info.goodsList["+index+"].packingTypeIndex"]: value
    });
  },
  // 输入赋值
  inputSetDataGoodsList(e){
    let {value} = e.detail;
    let { key,index } = e.currentTarget.dataset;
    this.setData({['info.goodsList['+index+'].'+key]:value});
  },  
  // 初始化提货、卸货选择列表
  initGoodsWork(){
    let pickWorkList = [],dischargeWorkList=[];
    this.data.info.workList.forEach(el=>{
      if(el.workType==1||el.workType==3){
        pickWorkList.push(el);
      }
      if(el.workType==2||el.workType==3){
        dischargeWorkList.push(el);
      }
    })
    this.setData({pickWorkList,dischargeWorkList});
    this.setGoodWork();
  },
  // 回显提货、卸货点
  setGoodWork(){
    let {pickWorkList,dischargeWorkList} = this.data;
    // 默认一个是直接赋值
    let index = this.data.info.goodsList.length-1;
    if(pickWorkList.length==1){
      this.setData({
        ['info.goodsList['+index+'].beginWorkId']:pickWorkList[0].workId,
        ['info.goodsList['+index+'].pickWorkIndex']:0,
      });
    }
    if(dischargeWorkList.length==1){
      this.setData({
        ['info.goodsList['+index+'].endWorkId']:dischargeWorkList[0].workId,
        ['info.goodsList['+index+'].dischargeWorkIndex']:0,
      });
    }
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
  },
  // 第三步  end

  // 第四步  start

  // 选择计费方式
  billingTypeChange(e){
    let {value} = e.detail;
    this.setData({
      ['info.fee.billingType']:this.data.billingTypeOrderList[value].codeValue,
      'billingTypeIndex':value,
    });
  },
  // 选择保价车型
  vehicleTypeQuoteChange(e){
    let {value} = e.detail;
    this.setData({
      ['info.fee.quoteVehicleType']:this.data.vehicleTypeQuoteList[value].codeValue,
      'vehicleTypeQuoteIndex':value,
    });
  },
  // 选择车型
  vehicleTypeChange(e){
    let {value} = e.detail;
    this.setData({
      ['info.fee.vehicleType']:this.data.vehicleTypeList[value].codeValue,
      'vehicleTypeIndex':value,
    });
  },
  // 选择车长
  vehicleLengthChange(e){
    let {value} = e.detail;
    this.setData({
      ['info.fee.vehicleLength']:this.data.vehicleLengthList[value].codeValue,
      'vehicleLengthIndex':value,
    });
  },
  // 选择结算方式
  payModeChange(e){
    let {value} = e.detail;
    this.setData({
      ['info.fee.payMode']:this.data.payModeList[value].codeValue,
      'payModeIndex':value,
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
  async queryFee(){
    let {tenantId,orderType,workList,goodsList} = this.data.info;
    let {billingType,quoteVehicleType,vehicleLength,netWeight,grossWeight,volume} = this.data.info.fee;
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
    // 不传tenantId、orderType、billingType不匹配报价
    if(common.isNotBlank(tenantId)&&common.isNotBlank(orderType)&&common.isNotBlank(billingType)){
      let res = await util.postByBeanName('ZCQuoteNewTF','matchMiniProgramOrderFee',{tenantId,orderType,billingType,workList,goodsList,quoteVehicleType,vehicleLength,volume,netWeight,grossWeight,volume});
      let fee = this.data.info.fee;
      Object.assign(fee,res);
      this.setData({['info.fee']:fee})
    }
  },  
  // 输入赋值
  inputSetDataFee(e){
    let {value} = e.detail;
    let { key } = e.currentTarget.dataset;
    this.setData({['info.fee.'+key]:value});
  },  

  // 第四步  end

  //原生 - input赋值
  inputSetDataDefault(e){
    let {value} = e.detail;
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
        await this.queryOpList();
        this.initWorkType();
        break;
      case 2:    //基础信息
        if(common.isBlank(this.data.info.orderType)){
          wxApi.showModal("请选择订单类型。")
          return;
        }else{
          this.queryGoodList();
          this.initGoodsWork();
        }
        break;
      case 3:
        this.initFeeData();
        break;
      case 4:
        this.queryFee();
        break;
    }
    step++;
    this.setData({step});
  },
  async submit(){
    await util.postByBeanName('orderTF','saveOrUpdateOrder',this.data.info);
    await wxApi.showModal("新增成功")
    wx.disableAlertBeforeUnload();
    wx.navigateBack({
      delta: 1,
    })
  }
})