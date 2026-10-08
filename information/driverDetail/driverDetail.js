import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowDateRange:false,
    fileList: [],
    idCardFrontList:[],
    idCardBackList:[],
    driverLicenceFrontList:[],
    driverLicenceBackList:[],
    info:{},
    isEdit : false,  //true绑定司机，false查看详情
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad({id}) {
    if(!common.isBlank(id)){
      wx.setNavigationBarTitle({title:"司机信息"})
      let info = await util.postByBeanName('driverTF','queryDriverInfoById',{id});
      // 遍历获取已选择供应商名称
      let supplierList = await util.postByBeanName('supplierTF','getSupplierSelectData');
      if(common.isNotBlank(info.supplierList)){
        let suppliersName = "";
        supplierList.forEach(el => {
          if(info.supplierList.includes(el.value)){
            suppliersName = suppliersName + el.label + "，";
          }
        })
        info.suppliersName = suppliersName;
      }
      this.formatData(info);
    }else{
      wx.setNavigationBarTitle({title:"绑定司机"})
      this.setData({isEdit:true})
    }
  },
  formatData(info){
    let idCardFrontList = [{ url: common.getBigImgPath(info.idCardFrontImgPath_) }];
    let idCardBackList = [{ url: common.getBigImgPath(info.idCardBackImgPath_) }];
    let driverLicenceFrontList = [{ url: common.getBigImgPath(info.driverLicenceFrontImgPath_) }];
    let driverLicenceBackList = [{ url: common.getBigImgPath(info.driverLicenceBackImgPath_) }];
    let qualifyCertList = [{ url: common.getBigImgPath(info.qualifyCertImgPath_) }];
    this.setData({info,idCardFrontList,idCardBackList,driverLicenceFrontList,driverLicenceBackList,qualifyCertList});
  },
  async queryInfo(){
    let {driverPhone} = this.data.info;
    if(common.isBlank(driverPhone)) return;
    let info = await util.postByBeanName('driverTF','queryTenantDriverMini',{driverPhone});
    this.formatData(info);
  },
  inputSetData(e){
    let value = e.detail;
    let { key } = e.currentTarget.dataset;
    this.data.info[key] = value;
    this.setData({ info: this.data.info });
  },
  async submit(){
    if(common.isBlank(this.data.info.driverId)){
      wxApi.showModal('系统没有查询到该司机信息！');
      return
    }
    await util.postByBeanName('driverTF','bandTenantDriverMini',{id:this.data.info.driverId});
    await wxApi.showModal('绑定成功');
    wx.navigateBack({
      delta: 1,
    })
  },
})