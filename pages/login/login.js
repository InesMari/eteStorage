import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'
let env = __wxConfig.envVersion;
Page({
  /**
   * 页面的初始数据
   */
  data: {
    username:'',
    password:'',
    disabled:false,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let billId = options.billId;
    this.setData({username:billId});
    this.initEnv();
  },
  initEnv(){    
    switch(env){
      // 开发环境
      case 'develop':
        console.log("开发环境");
        this.setData({isTest:true})
        break;
      // 体验版
      case 'trial':
        console.log("体验环境");
        this.setData({isTest:true})
        break;
    }
  },
  username(e) {
    this.setData({
      username: e.detail.value
    })
  },
  password(e) {
    this.setData({
      password: e.detail.value
    })
  },
  async login(e) {
    if(this.data.disabled) return;
    this.setData({disabled:true})
    try{
    let username = this.data.username;
    let password = this.data.password;
    if (username === "" || password === "") { //账号/密码为空
      await wxApi.showModal('请输入账号密码');
      return;
    } else if (username.length != 11) { //手机号码格式错误
      await wxApi.showModal('请输入正确的手机号');
      return;
    }
    //密码加密
    let pwd = util.rsaEncrypt(password);
    let res = await wxApi.login();
    let params = {
      wxCode: res.code,
      billId: username,
      password: pwd,
      programType:3
    };
    let data = await util.postByBeanName("wxUserTF", "login",params)
    /**
     * 登录成功
     * passwordFlag   1修改密码，2过期，9正常
     */
    if(data.passwordFlag==1){
      let info = encodeURI(JSON.stringify(data));
      wx.navigateTo({
        url: `/pages/resetPsw/resetPsw?info=${info}`,
      })
    }else if(data.passwordFlag==9){
      wx.setStorageSync('userInfo', data);
      wx.reLaunch({
        url: '/pages/index/index?chooseOrg=1',
      })
    }
    this.setData({disabled:false})
    }catch(e){      
      this.setData({disabled:false})
    }

  },
  toForgetPsw(){
    wx.navigateTo({
      url: '/pages/forgetPsw/forgetPsw',
    })
  },
  protocol(){
    wx.navigateTo({
      url: '/pages/protocol/protocol',
    })
  },
  toStorageList(){
    wx.navigateTo({
      url: '/storageReserve/storageList/storageList',
    })
  },
  toVisitorReg(){
    wx.navigateTo({
      url: '/storage/visitorReg/visitorReg/visitorReg',
    })
  },
})
