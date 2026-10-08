import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({entitys:common.getEntityIds()});
    wx.hideHomeButton();
    let userInfo = wx.getStorageSync('userInfo');
    userInfo.orgList.forEach(item => {
      if(userInfo.orgId == item.id){
        this.setData({currentOrg:item})
      }
    });
    this.setData({userInfo});
  },
  // 显示仓库选择弹窗
  changeWork(){
    let {currentOrg} = this.data;
    if(currentOrg.workList.length>1){
      this.setData({workAlert:true})
    }
  },
  // 选择仓库
  onWorkChange(event) {
    let id = event.detail;
    let {currentOrg,userInfo} = this.data;
    currentOrg.workList.forEach(el=>{
      if(el.workId == id){
        userInfo.workId = el.workId;
        userInfo.workName = el.workName;
        this.setData({userInfo});
        wx.setStorageSync('userInfo', userInfo);
        this.cancelWork();
        util.postByBeanName('wmsBaseTF','selWork',{workId:el.workId});
      }
    })
  },
  //取消选择组织
  cancelWork(){
    this.setData({
      workAlert:false
    })
  },
  goback(){
    wx.redirectTo({
      url: '/pages/index/index',
    })
  },
  toDelivery(){
    wx.navigateTo({
      url: '/storage/delivery/delivery',
    })
  },
  toWarehousing(){
    wx.navigateTo({
      url: '/storage/warehousing/warehousing',
    })
  },
  toPackageManager(){
    wx.navigateTo({
      url: '/storage/packageManager/packageManager',
    })
  },
  toScanCompare(){
    wx.navigateTo({
      url: '/storage/scanCompare/scanCompare',
    })
  },
  toWarehousingVerification(){
    wx.navigateTo({
      url: '/storage/verification/verification?operation=1',
    })
  },
  toExWarehouseverification(){
    wx.navigateTo({
      url: '/storage/verification/verification?operation=2',
    })
  },
  toCarryGoods(){
    wx.navigateTo({
      url: '/storage/carryGoods/carryGoods',
    })
  },
  toShortBarge(){
    wx.navigateTo({
      url: '/storage/shortBarge/shortBargeList/shortBargeList',
    })
  },
  toShortBarge(){
    wx.navigateTo({
      url: '/storage/shortBarge/shortBargeList/shortBargeList',
    })
  },
  toInspectTasks(){
    wx.navigateTo({
      url: '/storage/inspectTasks/inspectTasks',
    })
  },
  toInspectRegMain(){
    wx.navigateTo({
      url: '/storage/inspectReg/inspectRegMain/inspectRegMain',
    })
  },
  toVisitionReg(){
    wx.navigateTo({
      url: '/storage/visitorReg/visitorRegManage/visitorRegManage',
    })
  },
  toRecordSheet(){
    wx.navigateTo({
      url: '/storage/recordSheet/home/home',
    })
  },
})