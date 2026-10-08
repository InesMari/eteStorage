import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info:{
      searchKey:"",
      all:1,
      state:2,  //默认已报到
    },
    workList:[],
    isRefresh:false,
    active:2,
    workAlert:false,
    showAlert:false,
    showChangeTenantAlert:false,
    currentItem:{},
    newTenantName:'',
  },

  onShow() {
    this.doQuery(true);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.setData({entitys:common.getEntityIds()});
    let {workId} = wx.getStorageSync("userInfo");
    this.setData({
      workId,
      ['info.workId']:workId,
    })
    this.getWorkList();
    this.doQuery(true);
  },
  async doQuery(clear){
    if (clear) {  //clear为true的时候清空页码
      this.setData({ page: 1 });
    }
    let {info,page} = this.data;
    let {items,hasNext} = await util.postByBeanName('wmsAppointTF','queryWmsAppointInfoPage',{...info,page}); 
    if (clear) {  //clean为true的时候清空数组(请求后操作，避免出现阶段性页面空白)
      this.setData({ list: [] });
    }
    this.setData({ list: [...this.data.list, ...items], hasNext, isRefresh: false});
    this.watchWaitTime();
  },
  // 监听计算时间
  watchWaitTime(){
    this.calcWaitTime();
    clearInterval(this.interval);
    // 1分钟刷新一次
    this.interval = setInterval(() => {
      this.calcWaitTime();
    }, 60000);
  },
  // 计算时间
  calcWaitTime() {
    this.data.list.forEach(item => {
      if (item.state == 2) {
        let checkInDate = new Date(item.checkInDate);
        let currentDate = new Date();
        // 计算两个日期的毫秒差
        const diffInMs = Math.abs(currentDate - checkInDate);
        // 将毫秒转换为分钟（1分钟 = 60 * 1000 毫秒）
        item.waitTime = Math.floor(diffInMs / (1000 * 60));        
      }
    })
    this.setData({list:this.data.list})
  },
  getWorkList(){
    let userInfo = wx.getStorageSync('userInfo');
    userInfo.orgList.forEach(item => {
      if(userInfo.orgId == item.id){
        this.setData({currentOrg:item})
      }
    });
    this.setData({userInfo});
  },
  // 滚动加载
  scrolltolowerHandler(){
    if (this.data.hasNext) {
      this.setData({ page: ++this.data.page });
      this.doQuery()
    }
  },
  // 上拉刷新
  toupper(){
    this.setData({ isRefresh:true})
    this.doQuery(true);
  },
  search(e){
    this.setData({['info.searchKey']:e.detail})
    //延迟查询
    if (this.data.searchTimeout) clearTimeout(this.data.searchTimeout);
    this.data.searchTimeout = setTimeout(() => {
      this.doQuery(true)
      clearTimeout(this.data.searchTimeout);
    }, 300)
  },
  onChange(e){
    let waybillState = e.detail.name;
    switch(waybillState){
      case 0:this.setData({['info.state']:""}); break;   //全部
      case 1:this.setData({['info.state']:1}); break;    //已预约
      case 2:this.setData({['info.state']:2}); break;    //已报到
      case 3:this.setData({['info.state']:3}); break;    //操作中
      case 4:this.setData({['info.state']:4}); break;    //操作完成
      case 5:this.setData({['info.state']:5}); break;    //超时完成
    }
    this.doQuery(true);
  },
  // 拨打电话
  callPhone(e){
    let {phone} = e.currentTarget.dataset;
    wx.makePhoneCall({
      phoneNumber: phone 
    })

  },
  // 查看详情
  toDetail(e){
    let {id} = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: '../paymentDetail/paymentDetail?id='+id,
    })
  },
  cancelAlert(){
    this.setData({
      showAlert:false,
    })
  },
  // 审核不通过备注弹窗
  showAlertMethod(e){
    this.setData({currentItem:e.currentTarget.dataset.item,showAlert:true});
  },
  // 确认
  async sure(){
    this.cancelAlert();
    let {appointId,state} = this.data.currentItem;
    if(state == 2){
      state = 3;
    }else if(state == 3){
      state = 4;
    }
    await util.postByBeanName('wmsAppointTF','updateWmsAppointInfoState',{appointId,state});
    wxApi.showModal("确认成功");
    this.doQuery(true);
  },
  changWorkAlert(){
    this.setData({
      workAlert:true
    })
  },
  // 选择仓库
  onWorkChange(event) {
    let id = event.detail;
    let {currentOrg,userInfo} = this.data;
    currentOrg.workList.forEach(el=>{
      if(el.workId == id){
        userInfo.workId = el.workId;
        userInfo.workName = el.workName;
        this.setData({          
          ['info.workId']:el.workId,
          userInfo
        });
        wx.setStorageSync('userInfo', userInfo);
        this.cancelWork();
        util.postByBeanName('wmsBaseTF','selWork',{workId:el.workId});
      }
    })
    this.cancelWork();
    this.doQuery(true)
  },
  //取消选择组织
  cancelWork(){
    this.setData({
      workAlert:false
    })
  },
  // 修改厂商弹窗
  changeTenant(e){
    let {item} = e.currentTarget.dataset;
    this.setData({
      currentItem:item,
      newTenantName:'',
      showChangeTenantAlert:true
    });
  },
  // 输入新的厂商名称
  onTenantNameInput(e){
    this.setData({
      newTenantName:e.detail.value
    });
  },
  // 取消修改厂商
  cancelChangeTenant(){
    this.setData({
      showChangeTenantAlert:false,
      currentItem:{},
      newTenantName:''
    });
  },
  // 确认修改厂商
  async sureChangeTenant(){
    let {appointId} = this.data.currentItem;
    let {newTenantName} = this.data;
    if(!newTenantName || newTenantName.trim() === ''){
      wxApi.showToast('请输入新的到货厂商');
      return;
    }
    await util.postByBeanName('wmsAppointTF','updateWmsAppointFromTenantName',{appointId,fromTenantName:newTenantName.trim()});
    wxApi.showToast('修改成功');
    this.cancelChangeTenant();
    this.doQuery(true);
  },
  // 报到
  async appoint(e){
    let {appointId} = e.currentTarget.dataset.item;
    await util.postByBeanName('wmsAppointTF','wmsAppointInfoCheckInByStaff',{appointId});
    wxApi.showToast('报到成功');
    this.doQuery(true);
  },
})