import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    storeList:[],
    isLogin:false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow(){
    this.checkLogin();
  },
  onLoad: function (options) {
    wx.hideHomeButton();
  },
  // 检验token是否有效
  async checkLogin(){
    let tokenId = wx.getStorageSync('tokenIdAppoint');
    if(common.isNotBlank(tokenId)){
      let res = await wxApi.login();
      let data = await util.postByBeanName("wxUserTF", "checkLogin", {wxCode:res.code});
      if(data == "Y"){
        console.log('token有效');
        this.doQuery(true);
      }
    }
  },
  // 导航
  guide(e){
    var {latitude,longitude,workAddress} = e.currentTarget.dataset.item;
    var {latitude,longitude} = common.bMapTransQQMap(longitude,latitude);
    wx.showLoading({
      title: '正在加载地图',
    })
    wx.getLocation({
      type:"gcj02",
      success: function (res) {
        wx.openLocation({//​使用微信内置地图查看位置。
          latitude:Number(latitude),//要去的纬度-地址
          longitude:Number(longitude),//要去的经度-地址
          name:workAddress
        })
        wx.hideLoading()
      },
      fail(res){
        wx.hideLoading()
        if(res.errCode == 2){
          wxApi.showToast("请打开手机GPS定位服务！");
        }
      }
    })
  },
  async getPhoneNumber(){
    let res = await wxApi.login();
    let {token:tokenId,haveUnionId,billId} = await util.postByBeanName('wxUserTF','noAcctLogin',{wxCode:res.code});
    console.log(haveUnionId)
    wx.setStorageSync('tokenId', tokenId);
    wx.setStorageSync('tokenIdAppoint', tokenId);
    wx.setStorageSync('billId', billId);
    this.doQuery(true);
    if(!haveUnionId){
      wxApi.showModal("关注易迁易公众号，提前预约，快速入仓。")
    }
  },
  async doQuery(clear){
    if (clear) {  //clear为true的时候清空页码
      this.setData({ page: 1 });
    }
    let {page} = this.data;
    let {items,hasNext} = await util.postByBeanName('wmsAppointTF','queryWmsWorkInfoPage',{page}); 
    if (clear) {  //clean为true的时候清空数组(请求后操作，避免出现阶段性页面空白)
      this.setData({ storeList: [] });
    }
    this.setData({ storeList: [...this.data.storeList, ...items], hasNext, isRefresh: false,isLogin:true});
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
  // 查看大图
  seeBigImg(e){
    let { url } = e.currentTarget.dataset;
    wx.previewImage({
      current: url, // 当前显示图片的 http 链接
      urls: [url] // 需要预览的图片 http 链接列表
    })
  },
  toDetail(e){
    let { item } = e.currentTarget.dataset;
    let data = encodeURI(JSON.stringify(item));
    if(item.state==0 || common.isBlank(item.state)){
      wx.navigateTo({
        url: `../appointment/appointment?data=${data}`,
      })
    }else{
      wx.navigateTo({
        url: `../appointmentDetail/appointmentDetail?data=${data}`,
      })
    }
  },
})