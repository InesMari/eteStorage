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
    isUpdate:false,
    // minDate:new Date(1990, 0, 1).getTime(),
  },
  async onLoad({id}) {
    // 查询静态枚举
    await this.queryStaticData();
    if(common.isNotBlank(id)){
      wx.setNavigationBarTitle({title:"修改车辆信息"})
      var info = await util.postByBeanName('resVehicleInfoTF','queryVehicleInfoById',{id}); 
      let vehicleLicenseFrontList = [{ url: common.getBigImgPath(info.vehicleLicenseFrontImgPath_) }];
      let vehicleLicenseBackList = [{ url: common.getBigImgPath(info.vehicleLicenseBackImgPath_) }];
      let roadTransportCertificateList = [{ url: common.getBigImgPath(info.roadTransportCertificateImgPath_) }];
      let roadOperatingPermitList = [{ url: common.getBigImgPath(info.roadOperatingPermitImgPath_) }];
      // 遍历获取已选择供应商名称
      if(common.isNotBlank(info.supplierList)){
        let suppliersName = "";
        this.data.supplierList.forEach(el => {
          if(info.supplierList.includes(el.value)){
            suppliersName = suppliersName + el.label + "，";
          }
        })
        info.suppliersName = suppliersName;
      }
      this.setData({info,vehicleLicenseFrontList,vehicleLicenseBackList,roadTransportCertificateList,roadOperatingPermitList,isUpdate:true});
      // 遍历回显picker值
      this.eachPickerData(this.data.licensePlateColorList,info.licensePlateColor,'licensePlateColorIndex');   //车牌
      this.eachPickerData(this.data.vehicleTypeList,info.vehicleType,'vehicleTypeIndex');   //车型
      this.eachPickerData(this.data.vehicleTypeQuoteList,info.vehicleTypeQuote,'vehicleTypeQuoteIndex');   //报价车型
      this.eachPickerData(this.data.vehicleLengthList,info.vehicleLength,'vehicleLengthIndex');  //车长
      this.eachPickerData(this.data.energyTypeList,info.energyType,'energyTypeIndex');    //能源类型
      this.eachPickerData(this.data.useCharacterList,info.useCharacter,'useCharacterIndex');    //使用性质
    }
  },
  // 遍历回显picker值
  eachPickerData(list,codeValue,idxName){
    list.forEach(el => {
      if(el.codeValue == codeValue){
        this.setData({[idxName]:codeValue});
      }
    })
  },
  // 查询静态枚举
  async queryStaticData(){
    let {PLATE_COLOR,VEHICLE_TYPE,VEHICLE_LENGTH,VEHICLE_ENERGY_TYPE,VEHICLE_USE_CHARACTER,VEHICLE_TYPE_QUOTE} = await util.postByBeanName('commonTF','getSysStaticDataByCodeTypes',{codeType:"PLATE_COLOR,VEHICLE_TYPE,VEHICLE_LENGTH,VEHICLE_ENERGY_TYPE,VEHICLE_USE_CHARACTER,VEHICLE_TYPE_QUOTE"});
    this.setData({
      licensePlateColorList:PLATE_COLOR,
      vehicleTypeList:VEHICLE_TYPE,
      vehicleLengthList:VEHICLE_LENGTH,
      energyTypeList:VEHICLE_ENERGY_TYPE,
      useCharacterList:VEHICLE_USE_CHARACTER,
      vehicleTypeQuoteList:VEHICLE_TYPE_QUOTE
    })
    let supplierList = await util.postByBeanName('supplierTF','getSupplierSelectData');
    this.setData({ supplierList,supplierListCache: supplierList });
  },
  //vantui - input赋值
  inputSetData(e){
    let value = e.detail;
    let { key } = e.currentTarget.dataset;
    this.data.info[key] = value;
    this.setData({ info: this.data.info });
  },  
  //原生 - input赋值
  inputSetDataDefault(e){
    let {value} = e.detail;
    let { key } = e.currentTarget.dataset;
    this.data.info[key] = value;
    this.setData({ info: this.data.info });
  },
  // 日期选择
  bindDateChange: function(e) {
    let {value} = e.detail;
    let {key} = e.currentTarget.dataset
    this.data.info[key] = value;
    this.setData({ info: this.data.info });
  },
  // 选择车牌颜色
  licensePlateColorChange(e){
    let { value } = e.detail;
    this.setData({
      "info.licensePlateColor": this.data.licensePlateColorList[value].codeValue,
      licensePlateColorIndex: value
    })
  },
  // 选择车型
  vehicleTypeChange(e){
    let { value } = e.detail;
    this.setData({
      "info.vehicleType": this.data.vehicleTypeList[value].codeValue,
      vehicleTypeIndex: value
    })
  },
  // 选择车型
  vehicleTypeQuoteChange(e){
    let { value } = e.detail;
    this.setData({
      "info.vehicleTypeQuote": this.data.vehicleTypeQuoteList[value].codeValue,
      vehicleTypeQuoteIndex: value
    })
  },
  // 选择车长
  vehicleLengthChange(e){
    let { value } = e.detail;
    this.setData({
      "info.vehicleLength": this.data.vehicleLengthList[value].codeValue,
      vehicleLengthIndex: value
    })
  },
  // 选择能源类型
  energyTypeChange(e){
    let { value } = e.detail;
    this.setData({
      "info.energyType": this.data.energyTypeList[value].codeValue,
      energyTypeIndex: value
    })
  },
  // 使用性质
  useCharacterChange(e){
    let { value } = e.detail;
    this.setData({
      "info.useCharacter": this.data.useCharacterList[value].codeValue,
      useCharacterIndex: value
    })
  },

  async afterRead(event) {
    wx.showLoading();
    const { file } = event.detail;
    let {id} = event.currentTarget.dataset;
    let {data} = await util.uploadFile(file);
    wx.hideLoading();
    data = JSON.parse(data);  //数据转化
    //数据拼接保存
    this.data.info[id+'Img'] = data.content.flowId;
    this.data.info[id+'ImgPath'] = data.content.storePath;
    this.data[id+'List'] = [{...file,url:common.getBigImgPath(data.content.fullPath)}]
    this.setData({info:this.data.info,[id+'List']:this.data[id+'List']});
    this.checkImg(id);
  },
  /**
   * 识别图片
   * idCardFront  身份证
   * riverLicenceFront  驾驶证
   */
  async checkImg(id){
    if(id=="vehicleLicenseFront"){
      wx.showLoading({title: '正在识别行驶证信息'})
      let {plateNumber,vin,vehicleOwner,useCharacter,issueDateStr,registerDateStr} = await util.postByBeanName('resVehicleInfoTF','getVehicleLicenseInfo',{fileId:this.data.info.vehicleLicenseFrontImgPath},null,null,null,false);
      this.setData({
        ['info.plateNumber']:plateNumber,
        ['info.vin']:vin,
        ['info.vehicleOwner']:vehicleOwner,
        ['info.useCharacter']:useCharacter,
        ['info.issueDate']:issueDateStr,
        ['info.registerDate']:registerDateStr,
      });
    }
    wx.hideLoading();
  },
  deleteImg(event){
    let {id} = event.currentTarget.dataset;
    this.data.info[id+'Img'] = '';
    this.data.info[id+'ImgPath'] = '';
    this.data[id+'List'] = []
    this.setData({info:this.data.info,[id+'List']:this.data[id+'List']});
  },
  // 本地遍历查询供应商
  searchSupplierList(e){
    let value = e.detail.value;
    this.setData({ supplierListSearch: value });
    let supplierList = [];
    this.data.supplierListCache.forEach(el => {
      if(el.label.indexOf(value)>-1){  
        supplierList.push(el);
      }                       
    })
    this.setData({supplierList});
  },
  // 选择供应商popover
  showSupplierPopover(){
    let supplierList = this.data.info.supplierList;
    // 遍历获取已选择供应商
    this.data.supplierList.forEach(el => {
      el.select = false;
      if(common.isNotBlank(supplierList) && supplierList.includes(el.value)){
        el.select = true;
      }
    })
    this.setData({isShowSupplierPopover:true,supplierList:this.data.supplierList})
  },
  /**
   * 选择供应商
   */
  selectSupplier(e){
    let { item,index } = e.currentTarget.dataset;
    item.select = item.select?false:true;
    // 选择供应商逻辑
    this.setData({ 
      supplierListSearch:'',
      ['supplierList['+index+']']:item,
    });
  },
  /**
   * 确认选择供应商
   */
  sureSupplier(){
    let supplierList = [];
    let suppliersName = "";
    this.data.supplierList.forEach(el => {
      if(el.select){
        supplierList.push(el.value);
        suppliersName = suppliersName + el.label + '，';
      }
    })
    this.setData({isShowSupplierPopover:false,['info.supplierList']:supplierList,['info.suppliersName']:suppliersName})
  },
  clearSupplier(){
    this.data.supplierList.forEach(el => {
      el.select = false;
    })
    this.setData({supplierList:this.data.supplierList});
  },
  // 提交
  async submit(){
    this.data.info.vehicleAttribution = 1;
    await util.postByBeanName('resVehicleInfoTF','saveVehicleInfo',this.data.info);
    await wxApi.showModal('保存成功');
    wx.navigateBack({
      delta: 1,
    })
  },
})