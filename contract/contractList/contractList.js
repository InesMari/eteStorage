import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    active:0,
    info:{
      keyword:"",
      sts:10,
      type:2,
    },
    isRefresh:false,
  },

  onShow() {
    this.doQuery(true);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.setData({entitys:common.getEntityIds()});
    this.doQuery(true);
  },
  async doQuery(clear){
    if (clear) {  //clear为true的时候清空页码
      this.setData({ page: 1 });
    }
    let {info,page} = this.data;
    let {items,hasNext} = await util.postByBeanName('contractReviewTF','queryContractReviewPageForWechat',{...info,page}); 
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
    this.setData({['info.keyword']:e.detail})
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
      case 0:this.setData({['info.sts']:10}); break;    //待我处理
      case 1:this.setData({['info.sts']:""}); break;   //全部
      case 2:this.setData({['info.sts']:1}); break;    //未评审
      case 3:this.setData({['info.sts']:2}); break;    //评审中
      case 4:this.setData({['info.sts']:3}); break;    //评审完毕
      case 5:this.setData({['info.sts']:4}); break;    //已完结
      case 6:this.setData({['info.sts']:9}); break;    //评审不通过
    }
    this.doQuery(true);
  },
  // 查看详情
  toDetail(e){
    let {id} = e.currentTarget.dataset.item;
    wx.navigateTo({
      url: '../contractDetail/contractDetail?id='+id,
    })
  },
  
  // 备注
  inputSetRemark(e){
    let {value} = e.detail;
    this.setData({remark:value})
  },
  sureAlert(){
    let type = this.data.currentType;
    if(type == 1){
      this.audit();
    }else{
      if(common.isBlank(this.data.remark)){
        wxApi.showToast("请填写评审意见。");
        return;
      }
      this.unAudit();
    }
    this.cancelAlert();
  },
  cancelAlert(){
    this.setData({
      showAlert:false,
    })
  },
  // 评审弹窗
  showAlertMethod(e){
    let {type,id} = e.currentTarget.dataset;
    this.setData({
      showAlert:true,
      currentId:id,
      currentType:type
    })
  },
  // 评审不通过
  async unAudit(){
    let {remark} = this.data;
    let id = this.data.currentId;
    await util.postByBeanName('contractReviewTF','reviewContractInfo',{id,type:2,reviewRemark:remark});
    await wxApi.showModal("操作成功。");
    this.doQuery(true);
  },
  // 评审通过
  async audit(e){
    let {remark} = this.data;
    let id = this.data.currentId;
    await util.postByBeanName('contractReviewTF','reviewContractInfo',{id,type:1,reviewRemark:remark});
    await wxApi.showModal("操作成功。");
    this.doQuery(true);
  }
})