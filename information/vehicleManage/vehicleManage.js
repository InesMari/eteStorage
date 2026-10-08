import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[],
    page:1,
    params:{},
    isRefresh:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function (options) {
    this.setData({entitys:common.getEntityIds()});
    this.doQuery(true);
  },
  /**
   * 
   * @param clear true:重新加载 ,false:加载下一页
   */
  async doQuery(clear){
    if (clear) {  //clean为true的时候清空数组和页码
      this.setData({ page: 1 });
    }
    let {items,hasNext} = await util.postByBeanName('resVehicleInfoTF','queryVehicleInfoListByCond',{...this.data.params,page:this.data.page});
    if (clear) {  //clean为true的时候清空数组
      this.setData({ list: [] });
    }
    this.setData({ list: [...this.data.list, ...items], hasNext, isRefresh: false});
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
  // 搜索车牌
  search(e){
    this.setData({['params.plateNumber']:e.detail})
    //延迟查询
    if (this.data.searchTimeout) clearTimeout(this.data.searchTimeout);
    this.data.searchTimeout = setTimeout(() => {
      this.doQuery(true)
      clearTimeout(this.data.searchTimeout);
    }, 300)
  },
  // 启用禁用司机
  async updateState(e){
    let {vehicleId,sts,plateNumber} = e.currentTarget.dataset.item;
    let state = sts==0?1:0;
    await util.postByBeanName('resVehicleInfoTF','updateVehicleState',{vehicleIds:vehicleId, state, plateNumber});
    if(sts == 0){
      await wxApi.showModal('启用成功');  
    }
    if(sts == 1){
      await wxApi.showModal('禁用成功');  
    }
    this.doQuery(true);
  },
  // 远程解锁
  async unlock(e){
    wx.showModal({
      title: '提示信息',
      content: "是否确认远程开锁",
      async success(res){
        if (res.confirm) {
          let {equipmentNumber,lockNum} = e.currentTarget.dataset.item;
          await util.postByBeanName('equipmentTF','remoteOpenLockByEquipmentNumber',{equipmentNumber,lockNum});
          await wxApi.showModal('解锁成功');
        }
      },
    });
  },
  toAddVehicle(){
    wx.navigateTo({
      url: '../addVehicle/addVehicle',
    })
  },
  toEdit(e){
    let {id} = e.currentTarget.dataset;
    wx.navigateTo({
      url: '../addVehicle/addVehicle?id='+id,
    })
  },
  toDetail(e){
    let {id,state} = e.currentTarget.dataset;
    if(state!=2 || common.isBlank(state)){
      wx.navigateTo({
        url: '../vehicleDetail/vehicleDetail?id='+id,
      })
    }else{
      wx.navigateTo({
        url: '../addVehicle/addVehicle?id='+id,
      })
    }
  },
  toMonitor(){
    wx.navigateTo({
      url: '../vehicleMonitor/vehicleMonitor',
    })
  }
})