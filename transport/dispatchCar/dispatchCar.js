import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    info:{},  //提交对象
    isShowVehiclePopover:false,   //是否展示选择输入车辆弹窗
    vehicleList:[],  //车辆列表
    vehicleSearch:"",   //输入的车牌号
    vehicleListHasNext:false, //车辆列表是否有下一页
    isShowDriverPopover:false,   //是否展示选择输入司机弹窗
    driveList:[],  //司机列表
    driverSearch:[],    //输入的司机名称
    driveListHasNext:false, //司机列表是否有下一页
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad({info}) {
    info = JSON.parse(decodeURI(info));
    this.setData({info})
    this.queryStaticData();
    this.querySupplier();
  },
  // 查询供应商列表
  async querySupplier(){
    let supplierList = await util.postByBeanName('supplierTF','queryAllSupplierList');  //供应商
    this.setData({supplierList})
    //回显供应商
    supplierList.forEach((el,index)=>{
      if(el.tenantId==this.data.info.tenantId){
        this.setData({
          'supplierIndex': index
        });
      }
    })
  },
  /**
   * 查询提货车辆、提货司机列表
   */
  async queryList(){
    let vehicleList = await util.postByBeanName('resVehicleInfoTF','selVehicleInfoListByCond',{tenantId:this.data.info.tenantId});  //车辆
    let driveList = await util.postByBeanName('driverTF','selDriverInfoListByCond',{tenantId:this.data.info.tenantId});   //司机
    this.setData({
      vehicleList:vehicleList.items,
      vehicleListHasNext:vehicleList.hasNext,
      driveList:driveList.items,
      driveListHasNext:driveList.hasNext
    })
  },
  // 查询静态枚举
  async queryStaticData(){
    let {VEHICLE_TYPE,VEHICLE_LENGTH,WHETHER} = await util.postByBeanName('commonTF','getSysStaticDataByCodeTypes',{codeType:"VEHICLE_TYPE,VEHICLE_LENGTH"});
    this.setData({
      vehicleTypeList:VEHICLE_TYPE,
      vehicleLengthList:VEHICLE_LENGTH
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
      ["info.tenantId"]: supplier.tenantId,
      'supplierIndex': value
    });
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
      ['info.vehicleLength'] : item.vehicleLength,
      isShowVehiclePopover:false 
    });
    this.eachPickerData(this.data.vehicleTypeList,item.vehicleType,'vehicleTypeIndex');   //回显车型
    this.eachPickerData(this.data.vehicleLengthList,item.vehicleLength,'vehicleLengthIndex');   //回显车长
  },
  // 查询车辆
  searchVehicleList(e){
    let value = e.detail.value;
    this.setData({ vehicleSearch: value });
    //延迟查询
    if (this.data.searchTimeout) clearTimeout(this.data.searchTimeout);
    this.data.searchTimeout = setTimeout(async () => {
      let vehicleList = await util.postByBeanName('resVehicleInfoTF','selVehicleInfoListByCond',{tenantId:this.data.info.tenantId,plateNumber:value}); 
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
      ['info.linkPhone']: item.driverPhone, 
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
      let driveList = await util.postByBeanName('driverTF','selDriverInfoListByCond',{tenantId:this.data.info.tenantId,plateNumber:value});
      this.setData({
        driveList:driveList.items,
        driveListHasNext:driveList.hasNext,
      })
      clearTimeout(this.data.searchTimeout);
    }, 300)
  },

  // 确定派车
  async submit(){
    await util.postByBeanName('miniProgramWaybillTF','waybillSendCarZC',this.data.info);
    await wxApi.showModal("派车成功！");
    wx.navigateBack({
      delta: 1,
    })
  },
})