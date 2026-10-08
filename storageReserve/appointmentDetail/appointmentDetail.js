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
    plates:[],
    opTypeIndex:0,
    isLogin:false,
    disabled:false,
    show:false,
    showReportModal:false,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(query) {
    wx.hideHomeButton();
    // 扫码进入
    if(common.isNotBlank(query.scene)){
      var workId = decodeURIComponent(query.scene);
      this.setData({['info.workId']:workId,arrive:true});
      // 扫码进入检验登录状态
      this.checkLogin();
    }
    // 列表进入
    if(common.isNotBlank(query.data)){
      let info = JSON.parse(decodeURI(query.data));
      info.billId = info.billId?info.billId:wx.getStorageSync('billId');
      this.setData({info,isLogin:true})
      this.getStaticData();
    }
    let onlyAppoint = await util.postByBeanName('wmsAppointTF','checkWmsAppointSelfCheckIn',{workId:this.data.info.workId});
    this.setData({onlyAppoint})
  },
  // 检验token是否有效
  async checkLogin(){
    let tokenId = wx.getStorageSync('tokenIdAppoint');
    if(common.isNotBlank(tokenId)){
      let res = await wxApi.login();
      let data = await util.postByBeanName("wxUserTF", "checkLogin", {wxCode:res.code});
      if(data == "Y"){
        console.log('token有效');
        this.setData({isLogin:true})
        await this.checkDistance();
        this.getStaticData();
      }
    }
  },
  // 获取手机号码登录
  async getPhoneNumber(){
    let res = await wxApi.login();
    let {token:tokenId,haveUnionId} = await util.postByBeanName('wxUserTF','noAcctLogin',{wxCode:res.code});
    console.log(haveUnionId)
    wx.setStorageSync('tokenId', tokenId);
    wx.setStorageSync('tokenIdAppoint', tokenId);
    await this.checkDistance();
    this.getStaticData();
    if(!haveUnionId){
      wxApi.showModal("关注易迁易公众号，提前预约，快速入仓。")
    }
  },
  // 判断距离是否跳转至预约页面
  checkDistance(){    
    let _this = this;
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type:"gcj02",
        success(res){
          let point = common.qqMapTransBMap(res.longitude,res.latitude);        
          util.postByBeanName('wmsAppointTF','queryWmsWorkInfo',{workId:_this.data.info.workId},function(data){
            // let distance = common.getMapDistance(data.latitude,data.longitude,point.latitude,point.longitude);
            // console.log(data);
            // let isArrive = false;
            // if(distance<5000) isArrive = true;
            // if(common.isNotBlank(data.sonWorkList)){
            //   data.sonWorkList.forEach(el => {
            //     let sonDis = common.getMapDistance(el.latitude,el.longitude,point.latitude,point.longitude);
            //     if(sonDis<5000) isArrive = true;
            //   })
            // }
            if(common.isBlank(data.appointId)){
              data = encodeURI(JSON.stringify(data));
              wx.redirectTo({
                url: `../appointment/appointment?data=${data}`,
              })
            }
            _this.checkWmsAppointSelfCheckIn();
            resolve();
          })
        },
        fail(error){
          wxApi.showToast("请打开定位服务。")
        }
      })
    })
  },
  // 仓库是否只支持预约
  async checkWmsAppointSelfCheckIn(data){
    if(this.data.onlyAppoint && common.isBlank(data.appointId)){
      wx.redirectTo({
        url: `../appointment/appointment`,
      })
    }
    this.setData({onlyAppoint})
  },
  // 获取静态数据
  async getStaticData(){
    // 获取自己输入过的到货厂商
    let fromTenants = await util.postByBeanName('wmsAppointTF','queryUsedTenantName');
    // 获取自己输入过的车牌号码
    let plates = await util.postByBeanName('wmsAppointTF','queryUsedPlateNumber');
    // 车长枚举
    let {VEHICLE_LENGTH,APPOINT_OP_TYPE} = await util.postByBeanName('commonTF','getSysStaticDataByCodeTypes',{codeType:"VEHICLE_LENGTH,APPOINT_OP_TYPE"});
    this.setData({
      vehicleLengthList:VEHICLE_LENGTH,
      opTypeList:APPOINT_OP_TYPE,
      fromTenants,
      plates,
      isLogin:true
    })
    
    this.queryDetail();
  },
  // 查详情
  async queryDetail(){
    let {appointId,workName,workId} = this.data.info;
    if(common.isNotBlank(workId)){
      var info = await util.postByBeanName('wmsAppointTF','getWmsAppointInfo',{workId});
      info.workId = workId;
      info.opType = info.opType?info.opType:1;
    }else{
      var info = await util.postByBeanName('wmsAppointTF','getWmsAppointInfo',{appointId});
      info.workName = workName;
    }
    let imgList = [{url:common.getBigImgPath(info.url)}]
    this.setData({info,imgList,disabled:info.state==2?true:false})
    this.data.vehicleLengthList.forEach((el,i) => {
      if(el.codeValue == info.vehicleLength){
        this.setData({vehicleLengthIndex:i})
      }
    })
    this.data.opTypeList.forEach((el,index) => {
      if(el.codeValue == this.data.info.opType){
        this.setData({opTypeIndex:index})
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
  //修改预约
  async edit(){
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
    if(common.isBlank(this.data.info.goodsCount)){
      wxApi.showToast("请输入托数！");
      return
    }
    await util.postByBeanName('wmsAppointTF','updateWmsAppoint',this.data.info);
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
    this.queryDetail();
    this.setData({showFinish:false})
  },
  //确定报到
  async submit(){
    if(common.isBlank(this.data.info.beginAddress)){
      wxApi.showToast("请输入出发点。");
      return
    }
    let _this = this;
    let timer;
    wx.getLocation({
      type:"gcj02",
      success(res){
        _this.setData({submitDisabled:true})
        timer = setTimeout(()=>{
          _this.setData({submitDisabled:false})
          clearTimeout(timer);
        },10000)
        // let point = common.qqMapTransBMap(res.longitude,res.latitude);        
        // let distance = common.getMapDistance(_this.data.info.latitude,_this.data.info.longitude,point.latitude,point.longitude);
        // let isArrive = false;   //是否到达5公里范围内
        // if(distance<5000) isArrive = true;        
        // if(common.isNotBlank(_this.data.info.sonWorkList)){
        //   _this.data.info.sonWorkList.forEach(el => {
        //     let sonDis = common.getMapDistance(el.latitude,el.longitude,point.latitude,point.longitude);
        //     if(sonDis<5000) isArrive = true;
        //   })
        // }
        // if(!isArrive){
        //   wxApi.showModal("您不在此物流中心5000米范围内，暂时无法报到！");
        // }else{
        //   util.postByBeanName('wmsAppointTF','wmsAppointInfocheckIn',_this.data.info,function(){
        //     wxApi.showModal("报到成功");
        //     _this.queryDetail();
        //   });
        // }
        _this.data.info.latitude = res.latitude;
        _this.data.info.longitude = res.longitude;
        util.postByBeanName('wmsAppointTF','wmsAppointInfocheckIn',_this.data.info,function(){
          wxApi.showModal("报到成功");
          _this.queryDetail();
        });
      },
      fail(){
        wxApi.showToast("请打开定位服务。")
      }
    })
  },
  // 拨打电话
  callPhone(){
    wx.makePhoneCall({
      phoneNumber: this.data.info.servicePhone
    })
  },
  updatePhone(){
    this.setData({ show: true });
  },
  async savePhone(event) {
    let info = common.copyObj(this.data.info);
    info.billId = this.data.info.newBillId;
    await util.postByBeanName('wmsAppointTF','updateWmsAppoint',info);
    this.queryDetail();
    wxApi.showToast("修改手机号成功。")
  },

  onClose() {
    this.setData({ show: false });
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
