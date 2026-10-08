import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info:{
      peopleInjurySts:0,
      orgName:wx.getStorageSync("userInfo").orgName,
      userName:wx.getStorageSync("userInfo").userName,
      files:[]
    },
    isshoVideoView:false,
    isShowCustomerPopover:false,
    active:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad({id}) {
    this.initScroll();
    await this.initData();
    if(common.isNotBlank(id)) this.doQuery(id);
  },
  async initData(){
    let relCustTenantList = await util.postByBeanName('customerTF','loadCustomerList',{isLoadAllCustomer:1});
    this.setData({relCustTenantList,relCustTenantListCache:relCustTenantList})
  },
  async doQuery(id){
    let info = await util.postByBeanName('exceptionTF','getExceptionInfo',{id});
    info.orgName = wx.getStorageSync("userInfo").orgName;
    info.userName = wx.getStorageSync("userInfo").userName;
    info.files.forEach(el => {
      let name = el.fileUrl.substring(el.fileUrl.lastIndexOf('/'),el.fileUrl.length);
      let num = name.indexOf('.');
      let suffix = name.substring(num,name.length);
      if(suffix.indexOf('.mp4')>-1){  //视频
        el.fileType = 1;
      }else{  //图片
        el.fileType = 0;
      }
    });
    this.data.relCustTenantList.forEach((item,index) => {
      if(item.tenantId == info.relCustTenantId){
        this.setData({relCustTenantIndex:index})
      }
    })
    this.setData({info});
  },
  onPageScroll(e){
    if(e.scrollTop<this.data.constractTop){
      if(!this.data.inBase){
        this.setData({inBase:true,active:0});
      }
    }else{
      if(this.data.inBase){
        this.setData({inBase:false,active:1});
      }
    }
  },
  // 滚动逻辑
  initScroll(){
    let query = wx.createSelectorQuery().in(this);
    query.select("#base").boundingClientRect();
    query.select("#constract").boundingClientRect();
    let _this = this;
    query.exec(function (res) { 
      _this.setData({
        baseTop:res[0].top + 130,
        constractTop:res[1].top - 50,
      })
    });
  },
  // 滚动位置
  toScroll(e){
    let {index} = e.detail;
    if(index==0){
      var scrollTop = 0;
    }else if(index==1){
      var scrollTop = this.data.constractTop;
    }
    wx.pageScrollTo({
      scrollTop,
      duration: 300
    });  
  },
  //原生 - input赋值
  inputSetDataDefault(e){
    let {value} = e.detail;
    let { key } = e.currentTarget.dataset;
    this.setData({['info.'+key]:value});
  },
  // 事发时间
  changeDate(e){
    let value = e.detail;
    this.setData({['info.incidentDate']:value});
  },
  // 切换异常类型
  changeType(e){
    let { type } = e.currentTarget.dataset;
    this.setData({['info.type']:type});
  },
  // 选择客户
  relCustTenantChange(e){
    let {value} = e.detail;
    this.setData({
      ['info.relCustTenantId']:this.data.relCustTenantList[value].tenantId,
      'relCustTenantIndex':value,
    });
  },
  // switch按钮切换
  switchChange(e){
    let value = e.detail;
    let { key } = e.currentTarget.dataset;
    if(value){
      this.setData({['info.'+key]:1})
    }else{
      this.setData({['info.'+key]:0})
    }
  },  
  // 选择图片视频
  async chooseLocation(){
    let _this = this;
    wx.chooseMedia({
      count: 1,
      mediaType: ['image','video'],
      sourceType: ['album', 'camera'],
      maxDuration: 60,
      camera: 'back',
      async success(res){
        let errMsg = res.errMsg
        if(errMsg != "chooseMedia:ok"){
           wxApi.showToast("本地上传文件失败");
           return;
        }
        if(common.isBlank( res.tempFiles) ||  res.tempFiles.length == 0){
          wxApi.showToast("本地上传文件失败");
          return;
        }
        let tempFileObject = res.tempFiles[0];
        tempFileObject.path = tempFileObject.tempFilePath;
        let tempFile = tempFileObject.tempFilePath;
        let fileType = tempFileObject.fileType;
        if(common.isBlank(tempFile) || common.isBlank(fileType)){
           wxApi.showToast("本地上传文件失败");
           return;
        }
        wx.showLoading();
        let {data} = await util.uploadFile(tempFileObject);
        wx.hideLoading();
        data = JSON.parse(data);  //数据转化
        let obj = {};
        obj.url = data.content.fullPath;
        obj.fileUrl = data.content.fullPath;
        obj.fileId = data.content.flowId;
        obj.filePath = data.content.storePath;
        obj.fileType = fileType=="image"?0:1;
        _this.data.info.files.push(obj);
        _this.setData({['info.files']:_this.data.info.files});
      },
      fail(res){
        console.log(res)
        if(res.errMsg == "chooseMedia:fail cancel"){
          wxApi.showToast("取消本地上传");
          return;
        }
        wxApi.showToast("本地上传文件失败");
      },
    })
  },
  // 删除
  delFile(e){
    let { index } = e.currentTarget.dataset;
    this.data.info.files.splice(index,1);
    this.setData({['info.files']:this.data.info.files});
  },
  // 查看文件
  visitFile(e){
    let { item } = e.currentTarget.dataset;
    if(item.fileType == 0){ //图片
      wx.previewImage({
        urls: [common.getBigImgPath(item.url)],
      })
    }else{  //视频
      this.setData({isshoVideoView:true,videoSrc:item.url})
    }
  },
  // 下载视频
  downVideo(){
    wx.showLoading();
    wx.downloadFile({
      url: this.data.videoSrc,
      success: res => {
          console.info(res);
          //保存到相册
          wx.saveVideoToPhotosAlbum({
              filePath: res.tempFilePath,
              success: res => {
                wx.hideLoading();
                  console.info(res);
                  wxApi.showToast('视频保存到相册');
              },
              fail: res => {
                wx.hideLoading();
                console.info(res);
                wxApi.showToast('该手机系统不支持保存视频')
              }
          })
      },
      fail: res => {
        wx.hideLoading();
        wxApi.showToast('该手机系统不支持保存视频')
      }
    })
  },
  closeVideoView(){
    this.setData({isshoVideoView:false})
  },
  /**
   * 选择客户
   */
  selectCustomer(e){
    let { item } = e.currentTarget.dataset;
    this.setData({ 
      ['info.relCustTenantName']: item.name, 
      ['info.relCustTenantId']: item.tenantId,
      isShowCustomerPopover:false
    })
    this.queryRouterList();
  },
  // 客户列表 - popover
  showCustomerPopover(){
    this.setData({isShowCustomerPopover:true})
  },
  // 过滤客户列表 - popver
  searchCustomerList(e){
    let value = e.detail.value;
    this.setData({ customerSearch: value });
    //延迟查询
    if (this.data.searchTimeout) clearTimeout(this.data.searchTimeout);
    this.data.searchTimeout = setTimeout(async () => {
      let relCustTenantList = [];
      this.data.relCustTenantListCache.forEach(el => {
        if(el.name.indexOf(value) > -1){
          relCustTenantList.push(el);
        }
      })
      this.setData({relCustTenantList});
      clearTimeout(this.data.searchTimeout);
    }, 300)
  },
  // 显示tip
  showTip(){
    this.setData({isshowTip:true})
  },
  hideTip(){
    this.setData({isshowTip:false})
  },
  // 提交
  async submit(){
    if(common.isBlank(this.data.info.lossFee)){
      wxApi.showToast("请填写财产损失金额！");
      return
    }
    await util.postByBeanName('exceptionTF','saveExceptionInfo',this.data.info);
    await wxApi.showModal("保存成功")
    wx.navigateBack({
      delta: 1,
    })
  },
})