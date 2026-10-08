import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
    counts:{},
  },
  onShow(){
    this.loadTodoData();
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({entitys:common.getEntityIds()});
    wx.hideHomeButton();
    let userInfo = wx.getStorageSync('userInfo');
    let currentOrg = '';
    userInfo.orgList.forEach(el => {
      if(el.id == userInfo.orgId){
        currentOrg = el;
        // 没有workList跳转到登陆页，后面token失效后需要删除
        // if(common.isBlank(el.workList)){
        //   wx.reLaunch({
        //     url: '/pages/login/login',
        //   })
        // }
        if(common.isNotBlank(el.workList)){
          userInfo.workId = el.workList[0].workId;
          userInfo.workName = el.workList[0].workName;
          util.postByBeanName('wmsBaseTF','selWork',{workId:userInfo.workId});
        }
        wx.setStorageSync('userInfo', userInfo);
      }
    })
    this.setData({userInfo,currentOrg});
    this.loadTodoData();
    if(options.chooseOrg == 1){
      this.showOrgAlert();
    }
  },
  // 显示组织选择弹窗
  showOrgAlert(){
    if(common.isNotBlank(this.data.userInfo.orgList)&&this.data.userInfo.orgList.length>1){
      this.setData({organizationAlert:true,currentOrgCache:this.data.currentOrg})
    }
  },
  // 选择组织
  onChange(event) {
    let id = event.detail;
    let currentOrg = "";
    this.data.userInfo.orgList.forEach(el=>{
      if(el.id == id){
        currentOrg = el;
      }
    })
    this.setData({currentOrg});
  },
  // 确认选择组织
  async sureOrg(){
    this.setData({organizationAlert:false});
    let {userInfo,currentOrg} = this.data;
    userInfo.orgId = currentOrg.id;
    userInfo.orgName = currentOrg.orgName;
    userInfo.regionId = currentOrg.regionId;
    userInfo.workId = currentOrg.workList[0].workId;
    userInfo.workName = currentOrg.workList[0].workName;
    let {orgId,regionId} = userInfo;
    await util.postByBeanName('wxUserTF','selOrg',{orgId,regionId});
    wx.setStorageSync('userInfo', userInfo);
    util.postByBeanName('wmsBaseTF','selWork',{workId:userInfo.workId});
    this.setData({userInfo});
  },
  //取消选择组织
  cancelOrg(){
    this.setData({
      currentOrg:this.data.currentOrgCache,
      organizationAlert:false
    })
  },
  async loadTodoData(){
    let counts = await util.postByBeanName('wxUserTF','loadTodoData');
    this.setData({counts})
  },
  toStorage(){
    if(common.isBlank(this.data.userInfo.workId)){
      wxApi.showModal("您的账号暂时未开通仓储管理权限,如需开通，请联系系统管理员。")
      return
    }
    wx.redirectTo({
      url: '/storage/home/home',
    })
  },
  toTransport(){
    wx.redirectTo({
      url: '/transport/home/home',
    })
  },
  toReceipts(){
    wx.redirectTo({
      url: '/receipts/home/home',
    })
  },
  // 合同管理
  toContract(){
    wx.navigateTo({
      url: '/contract/home/home',
    })
  },
  toAssets(){
    wx.redirectTo({
      url: '/assets/home/home',
    })
  },
  toFindcar(){
    wx.navigateTo({
      url: '/findcar/findcar',
    })
  },
  towxOrderCode(){
    wx.navigateTo({
      url: '/transport/wxOrderCode/wxOrderCode',
    })
  },
  toExcept(){
    wx.navigateTo({
      url: '/except/exceptManage/exceptManage',
    })
  },
  toPurchase(){
    wx.navigateTo({
      url: '/purchase/home/home',
    })
  },
  toOwnVehicle(){
    wx.navigateTo({
      url: '/ownVehicle/home/home',
    })
  },
  toInformation(){
    wx.navigateTo({
      url: '/information/home/home',
    })
  },
  // 退出登录
  async toLogout(){
    await util.postByBeanName('wxUserTF','logout',{});
    wx.removeStorageSync('userInfo');
    wx.reLaunch({
      url: '/pages/guideIndex/guideIndex',
    })
  }
})