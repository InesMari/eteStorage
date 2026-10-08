import {
  util,
  wxApi,
  common,
  regeneratorRuntime
} from '../../common/commonImport'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    head: [],
    expireDayTypeIndex:0,
    param:{
      type:1,
      searchKey:'',
      count:99,
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad({
    tab,type
  }) {
    this.setData({tab,['param.type']:type})
    await this.doQuery();
    await this.initData();
  },
  async doQuery() {
    let tab = this.data.tab;
    if (tab == 1) {
      // 保险到期
      wx.setNavigationBarTitle({title:"车辆保险到期列表"});
      var head = [{
          name: "车牌号码",
          code:"plateNumber"
        },
        {
          name: "合同类型",
          code:"vehicleInsuranceTypeName"
        },
        {
          name: "合同截止日期",
          code:"endDate"
        },
        {
          name: "到期剩余天数",
          code:"dayText"
        },
      ]
      var list = await util.postByBeanName('contractService', 'queryInsuranceContractPageForWechat', this.data.param);
    } else if (tab == 2) {
      // 年检到期
      wx.setNavigationBarTitle({title:"车辆年检到期列表"});
      var head = [{
          name: "车牌号码",
          code:"plateNumber"
        },
        {
          name: "年检截止日期",
          code:"endDate"
        },
        {
          name: "到期剩余天数",
          code:"dayText"
        },
      ]
      var list = await util.postByBeanName('vehicleAnnualInspectionTF', 'queryVehicleAnnualInspectionPageForWechat', this.data.param);
    } else if (tab == 3) {
      // 保养到期
      wx.setNavigationBarTitle({title:"车辆保养到期列表"});
      var head = [{
          name: "车牌号码",
          code:"plateNumber"
        },
        {
          name: "下次保养日期",
          code:"endDate"
        },
        {
          name: "剩余天数",
          code:"dayText"
        },
      ]
      var list = await util.postByBeanName('vehicleRepairCostService', 'queryVehicleRepairCostPageForWechat', this.data.param);
    }
    this.setData({
      head,
      list:list.items,
    });
  },
  async initData(){
    let {
      EXPIRE_DAY_TYPE
    } = await util.postByBeanName('commonTF', 'getSysStaticDataByCodeTypes', {
      codeType: "EXPIRE_DAY_TYPE"
    });
    let expireDayTypeIndex = 0;
    EXPIRE_DAY_TYPE.forEach((item,index) => {
      if(item.codeValue == this.data.param.type){
        expireDayTypeIndex = index;
      }
    })
    this.setData({
      expireDayTypeList: EXPIRE_DAY_TYPE,
      expireDayTypeIndex,
    });
  },
  //原生 - input赋值
  inputSetDataDefault(e) {
    let {
      value
    } = e.detail;
    let {
      key
    } = e.currentTarget.dataset;
    this.data.param[key] = value;
    this.setData({
      param: this.data.param
    });
  },
  // 选择日期
  expireDayTypeChange(e) {
    let {
      value
    } = e.detail;
    this.setData({
      "param.type": this.data.expireDayTypeList[value].codeValue,
      expireDayTypeIndex: value
    })
  },
})