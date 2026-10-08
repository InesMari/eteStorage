import {util,wxApi,common,regeneratorRuntime} from '../../../common/commonImport'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
    showUnPassAlert:false,
    sensorMonth: '',
    forkliftMonth:'',
    fireHydrantYear:'',
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({entitys:common.getEntityIds()});
    wx.hideHomeButton();
    let userInfo = wx.getStorageSync('userInfo');
    this.setData({userInfo});
    this.initMonth();
  },
  goback(){
    wx.redirectTo({
      url: '/pages/index/index',
    })
  },
  initMonth(){
    // 1. 获取当前系统时间
    const now = new Date();
    const year = now.getFullYear(); // 年份（如2023）
    let month = now.getMonth() + 1; // 月份（注意：getMonth()返回0-11，需+1）

    // 2. 月份补0（确保格式为两位数，如9月→09）
    const monthStr = month < 10 ? `0${month}` : month.toString();

    // 3. 设置默认值
    this.setData({
      sensorMonth: `${year}-${monthStr}`, // 默认选中当前年月（格式适配picker）
      forkliftMonth: `${year}-${monthStr}`, // 默认选中当前年月（格式适配picker）
      fireHydrantYear: `${year}`, // 默认选中当前年份
    });
  },
  // 温湿度弹窗 start
  sensorChooseMonth(){
    this.setData({
      showSensorAlert: true,
    });
  },
  cancelSensorAlert(){
    this.setData({
      showSensorAlert: false,
    });
  },
  chooseSensorMonth(event) {
    this.setData({
      sensorMonth: event.detail.value,
    });
  },
  randomTime(){
    this.cancelSensorAlert();
    wx.navigateTo({
      url: `../humitureLogFd/humitureLogFd?month=${this.data.sensorMonth}`,
    })
  },
  fixedTime(){
    this.cancelSensorAlert();
    wx.navigateTo({
      url: `../humitureLogPy/humitureLogPy?month=${this.data.sensorMonth}`,
    })
  },
  // 温湿度弹窗 end
  
  // 叉车弹窗 start
  forkliftChooseMonth(){
    this.setData({
      showForkliftAlert: true,
    });
  },
  cancelForkliftAlert(){
    this.setData({
      showForkliftAlert: false,
    });
  },
  chooseForkliftMonth(event) {
    this.setData({
      forkliftMonth: event.detail.value,
    });
  },
  confirmForkliftAlert(){
    this.cancelForkliftAlert();
    wx.navigateTo({
      url: `../inspectionsLog/inspectionsLog?month=${this.data.forkliftMonth}`,
    })
  },
  // 叉车弹窗 end

  // 消防设施点检弹窗 start
  fireHydrantChooseMonth(){
    this.setData({
      showFireHydrantAlert: true,
    });
  },
  cancelFireHydrantAlert(){
    this.setData({
      showFireHydrantAlert: false,
    });
  },
  chooseFireHydrantYear(event) {
    this.setData({
      fireHydrantYear: event.detail.value,
    });
  },
  confirmFireHydrantAlert(){
    this.cancelFireHydrantAlert();
    wx.navigateTo({
      url: `../fireHydrant/fireHydrant?year=${this.data.fireHydrantYear}`,
    })
  },
  // 消防设施点检弹窗 end
})