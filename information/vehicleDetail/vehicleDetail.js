import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isshowIssueDateRange:false,
    isshowRegisterDateRange:false,
    fileList: [],
    info:{},
    isBang : false,  //true绑定司机，false查看详情
  },
  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad({id}) {
    if(!common.isBlank(id)){
      wx.setNavigationBarTitle({title:"车辆信息"})
      let info = await util.postByBeanName('resVehicleInfoTF','queryVehicleInfoById',{id});
      this.formatData(info);
    }else{
      wx.setNavigationBarTitle({title:"绑定车辆"})
      this.setData({isBang:true})
    }
  },
  async formatData(info){
    let vehicleLicenseFrontList = [{ url: common.getBigImgPath(info.vehicleLicenseFrontImgPath_) }];
    let vehicleLicenseBackList = [{ url: common.getBigImgPath(info.vehicleLicenseBackImgPath_) }];
    if(common.isNotBlank(info.roadTransportCertificateImgPath_)){
      var roadTransportCertificateList = [{ url: common.getBigImgPath(info.roadTransportCertificateImgPath_) }];
    }else{
      var roadTransportCertificateList = [];
    }
    if(common.isNotBlank(info.roadOperatingPermitImgPath_)){
      var roadOperatingPermitList = [{ url: common.getBigImgPath(info.roadOperatingPermitImgPath_) }];
    }else{
      var roadOperatingPermitList = [];
    }
    // 遍历获取已选择供应商名称
    let supplierList = await util.postByBeanName('supplierTF','getSupplierSelectData');
    if(common.isNotBlank(info.supplierList)){
      let suppliersName = "";
      supplierList.forEach(el => {
        if(info.tenantIds.includes(el.value)){
          suppliersName = suppliersName + el.label + "，";
        }
      })
      info.suppliersName = suppliersName;
    }
    this.setData({info,vehicleLicenseFrontList,vehicleLicenseBackList,roadTransportCertificateList,roadOperatingPermitList});
  },
  async queryInfo(){
    let {plateNumber,vinCheck} = this.data.info;
    if(common.isBlank(plateNumber)) return;
    if(common.isBlank(vinCheck)) return;
    try{
      let info = await util.postByBeanName('resVehicleInfoTF','queryTenantVehicleMini',{ plateNumber});
      info.vinCheck = vinCheck;
      if(vinCheck==info.vin.substring(info.vin.length-6)){
        this.formatData(info);
      }else{
        let info = {plateNumber,vinCheck};
        this.cleanImgData();
        this.setData({info});
        wxApi.showToast("识别代号后6位错误！")
      }
    }catch(e){
      let info = {plateNumber,vinCheck};
      this.cleanImgData();
      this.setData({info});
    }
  },
  inputSetData(e){
    let value = e.detail;
    let { key } = e.currentTarget.dataset;
    this.data.info[key] = value;
    this.setData({ info: this.data.info });
  },
  cleanImgData(){
    this.setData({
      vehicleLicenseFrontList:[],
      vehicleLicenseBackList:[],
      roadTransportCertificateList:[],
      roadOperatingPermitList:[]
    });
  },
  async submit(){
    await util.postByBeanName('resVehicleInfoTF','bandTenantVehicleMini',{id:this.data.info.vehicleId});
    await wxApi.showModal('绑定成功');
    wx.navigateBack({
      delta: 1,
    })
  },
})