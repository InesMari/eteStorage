import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showFinish:false,
    info:{},
    isshowHisList:true,
    fromTenants:[],
    opTypeIndex:null,
    plates:[],
    isShowTenantPopover:false,
    imgList:[],
    showReportModal:false,
  },
  onShow(){
    this.setData({showFinish:false})
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad({data}) {
    wx.hideHomeButton();
    let info = JSON.parse(decodeURI(data));
    info.billId = wx.getStorageSync('billId');
    info.parentWorkId = info.parentWorkId || info.workId;
    this.setData({info})
    this.getStaticData();
  },
  // 获取静态数据
  async getStaticData(){
    // 获取自己输入过的到货厂商
    let fromTenants = await util.postByBeanName('wmsAppointTF','queryUsedTenantName');
    // 获取自己输入过的车牌号码
    let plates = await util.postByBeanName('wmsAppointTF','queryUsedPlateNumber');
    // 到货厂商
    let {items} = await util.postByBeanName('wmsTenantTF','queryArrivalManufacturerTenantPage',{page:1,rows:999,workId:this.data.info.parentWorkId});
    // 车长枚举
    let {VEHICLE_LENGTH,APPOINT_OP_TYPE} = await util.postByBeanName('commonTF','getSysStaticDataByCodeTypes',{codeType:"VEHICLE_LENGTH,APPOINT_OP_TYPE"});
    // 仓库是否只支持预约
    let onlyAppoint = await util.postByBeanName('wmsAppointTF','checkWmsAppointSelfCheckIn',{workId:this.data.info.workId});
    this.setData({
      vehicleLengthList:VEHICLE_LENGTH,
      opTypeList:APPOINT_OP_TYPE,
      fromTenants,
      tenantsList:items,
      tenantsListCache:items,
      plates,
      onlyAppoint,
    })
    
    if(common.isNotBlank(this.data.info.appointId)){
      this.queryDetail();
    }
  },
  // 查详情
  async queryDetail(){
    let {appointId,workName} = this.data.info;
    let info = await util.postByBeanName('wmsAppointTF','getWmsAppointInfo',{appointId});
    info.workName = workName;
    this.setData({info})
    this.data.vehicleLengthList.forEach((el,i) => {
      if(el.codeValue == info.vehicleLength){
        this.setData({vehicleLengthIndex:i})
      }
    })
  },
  // 选择操作类型
  opTypeChange(e){
    let {value} = e.detail;
    this.setData({
      ['info.opType']:this.data.opTypeList[value].codeValue,
      'opTypeIndex':value,
    });
  },
  // 选择车长
  vehicleLengthChange(e){
    let {value} = e.detail;
    this.setData({
      ['info.vehicleLength']:this.data.vehicleLengthList[value].codeValue,
      'vehicleLengthIndex':value,
    });
  },

  /**
   * 选择到货厂商
   */
  selectTenant(e){
    let { item } = e.currentTarget.dataset;
    this.setData({ 
      ['info.fromTenantName']: item.name, 
      isShowTenantPopover:false
    })
  },
  // 到货厂商列表 - popover
  showTenantPopover(){
    this.setData({isShowTenantPopover:true})
  },
  // 过滤到货厂商列表 - popver
  searchTenantList(e){
    let value = e.detail.value;
    this.setData({ tenantSearch: value });
    //延迟查询
    if (this.data.searchTimeout) clearTimeout(this.data.searchTimeout);
    this.data.searchTimeout = setTimeout(async () => {
      let tenantsList = [];
      this.data.tenantsListCache.forEach(el => {
        if(el.name.indexOf(value) > -1){
          tenantsList.push(el);
        }
      })
      this.setData({tenantsList});
      clearTimeout(this.data.searchTimeout);
    }, 300)
  },
  //原生 - input赋值
  inputSetDataDefault(e){
    let {value} = e.detail;
    let { key } = e.currentTarget.dataset;
    this.data.info[key] = value;
    this.setData({ info: this.data.info });
  },
  // 预计到达时间
  changeDate(e){
    this.setData({ ['info.expectArriveDate']: e.detail });
  },
  // 过滤历史到货厂商
  filterHisList(e){
    let fromTenants = this.data.fromTenants;
    let fromTenantName = e.detail.value;
    let fromTenantsShow = [];
    fromTenants.forEach(el => {
      if(el.fromTenantName.indexOf(fromTenantName)>-1 || common.isBlank(fromTenantName)){
        fromTenantsShow.push(el);
      }
    })
    this.setData({fromTenantsShow,['info.fromTenantName']: fromTenantName});
  },
  // 隐藏历史到货厂商
  hideHisList(){
    const timer = setTimeout(()=>{
      this.setData({fromTenantsShow:[]});
      clearTimeout(timer);
    },400)
  },
  // 选择到货厂商
  selTenant(e){
    let {tenant} = e.currentTarget.dataset;
    this.setData({['info.fromTenantName']:tenant});
  },
  
  // 过滤历史车牌
  filterHisPlates(e){
    let plates = this.data.plates;
    let plateNumber = e.detail.value;
    let platesShow = [];
    plates.forEach(el => {
      if(el.plateNumber.indexOf(plateNumber)>-1 || common.isBlank(plateNumber)){
        platesShow.push(el);
      }
    })
    this.setData({platesShow,['info.plateNumber']: plateNumber});
  },
  // 隐藏历史车牌
  hideHisPlates(){
    const timer = setTimeout(()=>{
      this.setData({platesShow:[]});
      clearTimeout(timer);
    },400)
  },
  // 选择车牌
  selPlate(e){
    let {plate} = e.currentTarget.dataset;
    this.setData({['info.plateNumber']:plate});
  },
  // 上传照片
  async afterRead(event) {
    wx.showLoading();
    const { file } = event.detail;
    let {data} = await util.uploadFile(file);
    wx.hideLoading();
    data = JSON.parse(data);  //数据转化
    let imgList = [{url:data.content.fullPath}];
    this.data.info.url = data.content.fullPath;
    this.data.info.imgId = data.content.flowId;
    this.data.info.imgPath = data.content.storePath;
    this.data.info.fullPath = data.content.fullPath;
    this.setData({info:this.data.info,imgList});
  },
  // 删除照片
  deleteImg(){
    this.data.info.url = '';
    this.data.info.imgId = '';
    this.data.info.imgPath = '';
    this.data.info.fullPath = '';
    this.setData({imgList:[],info:this.data.info});
  },
  //确定预约
  async submit(){
    if(common.isBlank(this.data.info.beginAddress)){
      wxApi.showToast("请输入出发点。");
      return
    }
    // 供应商填写限制
    if(common.isNotBlank(this.data.info.fromTenantName) && this.data.info.fromTenantName.includes("易迁易")){
      wxApi.showToast("请输入到货供应商（厂商），而非易迁易！");
      return
    }
    // 福鼎仓到货厂商必填
    if(common.isBlank(this.data.info.fromTenantName) && this.data.info.parentWorkId == 1513){
      wxApi.showToast("请填写到货厂商！");
      return
    }
    if(common.isBlank(this.data.info.opType)){
      wxApi.showToast("请选择装卸货。");
      return
    }
    if(common.isBlank(this.data.info.goodsCount)){
      wxApi.showToast("请输入托数！");
      return
    }
    await util.postByBeanName('wmsAppointTF','addWmsAppoint',this.data.info);
    this.setData({showFinish:true})
  },
  // 返回
  back(){
    wx.navigateBack({
      delta: 1,
    })
  },
  // 立即报到
  toNext(){
    let workId = this.data.info.workId;
    wx.redirectTo({
      url: `../appointmentDetail/appointmentDetail?scene=${workId}`,
    })
  },
  
  // 打开廉洁举报弹窗
  showReport() {
    this.setData({ showReportModal: true });
  },
  // 关闭廉洁举报弹窗
  closeReport() {
    this.setData({ showReportModal: false });
  },
  // 阻止事件冒泡
  stopPropagation() {},
  // 拨打电话
  callReportPhone(e) {
    let phoneNumber = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phoneNumber
    });
  },
})
