import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'

Page({
  /**
   * 页面的初始数据
   */
  data: {
    billId:'',
    smsVaildCode:'',
    password:'',
    confirmPassword:'',
    isFirst:false,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function ({info,billId,smsVaildCode}) {
    //修改密码
    if(!common.isBlank(billId)&&!common.isBlank(smsVaildCode)){
      this.setData({billId,smsVaildCode,isFirst:false})
    }
    // 第一次登陆需要重置密码
    if(!common.isBlank(info)){
      info = JSON.parse(decodeURI(info));
      this.setData({info,isFirst:true})
    }
  },
  inputSetData(e) {
    let { value } = e.detail;
    let { key } = e.currentTarget.dataset;
    this.setData({ [key]: value });
  },
  clearData(e){
    let { key } = e.currentTarget.dataset;
    this.setData({ [key]: '' });
  },
  async submit(){
    let {password,confirmPassword,billId,smsVaildCode,isFirst,info} = this.data;
    if(!password){
      await wxApi.showModal('请输入密码')
      return false;
    }
    if(!confirmPassword){
      await wxApi.showModal('请输入二次确认密码')
      return false;
    }
    if(password!=confirmPassword){
      await wxApi.showModal('两次输入密码不一致')
      return false;
    }
    let param = {};
    if(isFirst){
      param.billId = info.billId;
    }else{
      param.billId = billId;      
      param.smsVaildCode = smsVaildCode;
    }
    param.password = util.rsaEncrypt(this.data.password);
    param.confirmPassword = util.rsaEncrypt(this.data.confirmPassword);
    if(isFirst){      
      let data = await util.postByBeanName("wxUserTF","modifyPasswordFirst",param);
      if(data){
        await wxApi.showModal('修改密码成功');
        wx.setStorageSync('userInfo', this.data.info);
        wx.reLaunch({
          url: '/pages/index/index',
        })
      }
    }else{
      let data = await util.postByBeanName("wxUserTF","smsModifyPassword",param);
      if(data){
        await wxApi.showModal('修改密码成功');
        wx.reLaunch({
          url: '/pages/login/login',
        })
      }
    }
    
  }
})
