import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowDateRange:false,
    fileList: [],
    info:{},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad({id}) {
    let supplierList = await util.postByBeanName('supplierTF','getSupplierSelectData');
    this.setData({ supplierList,supplierListCache: supplierList });
    if(common.isNotBlank(id)){
      wx.setNavigationBarTitle({title:"修改司机信息"})
      let info = await util.postByBeanName('driverTF','queryDriverInfoById',{id}); 
      let idCardFrontList = [{ url: common.getBigImgPath(info.idCardFrontImgPath_) }];
      let idCardBackList = [{ url: common.getBigImgPath(info.idCardBackImgPath_) }];
      let driverLicenceFrontList = [{ url: common.getBigImgPath(info.driverLicenceFrontImgPath_) }];
      let driverLicenceBackList = [{ url: common.getBigImgPath(info.driverLicenceBackImgPath_) }];
      let qualifyCertList = [{ url: common.getBigImgPath(info.qualifyCertImgPath) }];
      // 遍历获取已选择供应商名称
      if(common.isNotBlank(info.supplierList)){
        let suppliersName = "";
        supplierList.forEach(el => {
          if(info.supplierList.includes(el.value)){
            suppliersName = suppliersName + el.label + "，";
          }
        })
        info.suppliersName = suppliersName;
      }
      this.setData({info,idCardFrontList,idCardBackList,driverLicenceFrontList,driverLicenceBackList,qualifyCertList,isUpdate:true});
    }
  },
  inputSetData(e){
    let value = e.detail;
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
  async afterRead(event) {
    wx.showLoading();
    const { file } = event.detail;
    let {id} = event.currentTarget.dataset;
    let {data} = await util.uploadFile(file);
    wx.hideLoading();
    data = JSON.parse(data);  //数据转化
    console.log(data);
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
   * driverLicenceFront  驾驶证
   */
  async checkImg(id){
    if(id=="idCardFront"){
      wx.showLoading({title: '正在识别身份证信息'})
      let {idCardNum,name} = await util.postByBeanName('driverTF','getIdCardOcrData',{fileId:this.data.info.idCardFrontImgPath},null,null,null,false);
      this.setData({['info.driverName']:name});
      this.setData({['info.idCard']:idCardNum});
    }else if(id=="driverLicenceFront"){
      wx.showLoading({title: '正在识别驾驶证信息'})
      let {drivingLicense,driverClass,effectiveDateStr,expireDateStr} = await util.postByBeanName('driverTF','getDrivingLicenseOcrData',{fileId:this.data.info.driverLicenceFrontImgPath},null,null,null,false);
      this.setData({['info.driverLicence']:drivingLicense});
      this.setData({['info.driverClass']:driverClass});
      this.setData({['info.effectiveDate']:effectiveDateStr});
      this.setData({['info.expireDate']:expireDateStr});
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
  async submit(){
    await util.postByBeanName('driverTF','saveDriverProcess',this.data.info);
    await wxApi.showModal('保存成功');
    wx.navigateBack({
      delta: 1,
    })
  },
})