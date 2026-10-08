import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    active:0,
    info:{
      keyStr:"",
      type:2,
    },
    isRefresh:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow() {
    this.doQuery(true);
  },
  async doQuery(clear){
    if (clear) {  //clear为true的时候清空页码
      this.setData({ page: 1 });
    }
    let {info,page} = this.data;
    let {items,hasNext} = await util.postByBeanName('ordWaybillTF','queryOrdWaybillVehicleCheckPage',{...info,page}); 
    if (clear) {  //clean为true的时候清空数组(请求后操作，避免出现阶段性页面空白)
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
  search(e){
    this.setData({['info.keyStr']:e.detail})
    //延迟查询
    if (this.data.searchTimeout) clearTimeout(this.data.searchTimeout);
    this.data.searchTimeout = setTimeout(() => {
      this.doQuery(true)
      clearTimeout(this.data.searchTimeout);
    }, 300)
  },
  onChange(e){
    let confirmState = e.detail.name;
    switch(confirmState){
      case 0:this.setData({['info.confirmState']:""}); break;   //全部
      case 1:this.setData({['info.confirmState']:0}); break;    //未确认
      case 2:this.setData({['info.confirmState']:1}); break;    //确认通过
      case 3:this.setData({['info.confirmState']:2}); break;    //确认不通过
    }
    this.doQuery(true);
  },
  // 查看详情
  toDetail(e){
    let {item} = e.currentTarget.dataset;
    wx.navigateTo({
      url: '../vehicleCheckDetail/vehicleCheckDetail?id='+item.id
    })
  },
  
  // 备注
  inputSetRemark(e){
    let {value} = e.detail;
    this.setData({remark:value})
  },
  sureAlert(){
    this.unAudit();
    this.cancelAlert();
  },
  cancelAlert(){
    this.setData({
      showUnPassAlert:false,
    })
  },
  // 评审不通过备注弹窗
  showUnPassAlertMethod(e){
    this.setData({currentId:e.currentTarget.dataset.id})
    this.setData({
      showUnPassAlert:true,
    })
  },
  // 审核不通过
  async unAudit(e){
    let {remark} = this.data;
    let id = this.data.currentId;
    await util.postByBeanName('ordWaybillTF','confirmOrdWaybillVehicleCheck',{id,type:2,confirmRemark:remark});
    await wxApi.showModal("操作成功。");
    this.doQuery(true);
  },
  // 审核通过
  async audit(e){
    let {confirm} = await wxApi.showModal({
      title:"提示",
      content:"您正在操作车辆点检，是否继续？",
      showCancel:true
    })
    if(confirm){
      let {id} = e.currentTarget.dataset;
      await util.postByBeanName('ordWaybillTF','confirmOrdWaybillVehicleCheck',{id,type:1});
      this.doQuery(true);
    }
  },
})