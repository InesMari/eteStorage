import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    annex:[],
    showFinish:false,
    showUnPassAlert:false,
    info:{},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad({id}) {
    this.setData({entitys:common.getEntityIds()});
    common.checkAppointToken();
    this.initScroll();
    await this.initData();
    if(common.isNotBlank(id)) this.doQuery(id);  
  },
  async doQuery(id){
    let info = await util.postByBeanName('exceptionTF','getExceptionInfo',{id});
    info.isExamine = info.isExamine?1:0;
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
    this.data.exceptionStateList.forEach((item,index) => {
      if(item.codeValue == info.state){
        this.setData({exceptionStateIndex:index})
      }
    })
    if(common.isNotBlank(info.fileUrl)){
      this.setData({annex:[{url:info.fileUrl}]});
    }
    this.setData({info,disabled:(info.state!=0&&info.state!=1) || !this.data.entitys[1013006]});
  },
  async initData(){
    let relCustTenantList = await util.postByBeanName('customerTF','loadCustomerList',{isLoadAllCustomer:1});
    let {EXCEPTION_STATE} = await util.postByBeanName('commonTF','getSysStaticDataByCodeTypes',{codeType:"EXCEPTION_STATE"});
    EXCEPTION_STATE.length = 3;
    this.setData({relCustTenantList,exceptionStateList:EXCEPTION_STATE})
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
  // 损失金额
  inputSetDataFee(e){
    let {value} = e.detail;
    value = value.replace(/[^\d.]/g, ""); //清除“数字”和“.”以外的字符
    value = value.replace(/^(\-)*(\d+)\.(\d\d).*$/, '$1$2.$3'); //只能输入两个小数
    if (value.indexOf(".") < 0 && value != "") { 
        value = parseFloat(value);
    }
    this.setData({['info.actualLossFee']:value});
  },
  // 上传照片
  async afterRead(event) {
    wx.showLoading();
    const { file } = event.detail;
    let {data} = await util.uploadFile(file);
    wx.hideLoading();
    data = JSON.parse(data);  //数据转化
    let annex = [{url:data.content.fullPath}];
    this.data.info.url = data.content.fullPath;
    this.data.info.fileId = data.content.flowId;
    this.data.info.filePath = data.content.storePath;
    this.data.info.fullPath = data.content.fullPath;
    this.setData({info:this.data.info,annex});
  },
  // 删除照片
  deleteImg(){
    this.data.info.url = '';
    this.data.info.fileId = '';
    this.data.info.filePath = '';
    this.data.info.fullPath = '';
    this.setData({annex:[],info:this.data.info});
  },
  // 切换异常类型
  changeType(e){
    if(this.data.disabled) return;
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
  // 选择状态
  exceptionStateChange(e){
    let {value} = e.detail;
    this.setData({
      ['info.state']:this.data.exceptionStateList[value].codeValue,
      'exceptionStateIndex':value,
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
  /**
   * 查看大图
   */
  seeBigImg(e){
    let { url } = e.currentTarget.dataset;
    wx.previewImage({
      urls: [common.getBigImgPath(url)],
    })
  },
  // 查看文件
  visitFile(e){
    let { item } = e.currentTarget.dataset;
    if(item.fileType == 0){ //图片
      wx.previewImage({
        urls: [item.fileUrl],
      })
    }else{  //视频
      this.setData({isshoVideoView:true,videoSrc:item.fileUrl})
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
  // 复制视频链接
  copyLink(){
    wx.setClipboardData({
      data: this.data.videoSrc,
      success (res) {}
    })
  },
  // 查看附件大图
  seeBigImg(){
    wx.previewImage({
      urls: [common.getBigImgPath(this.data.info.fileUrl)],
    })
  },
  // 备注
  inputSetRemark(e){
    let {value} = e.detail;
    this.setData({verifyRemark:value})
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
  // 审核不通过备注弹窗
  showUnPassAlertMethod(){
    this.setData({
      showUnPassAlert:true,
    })
  },
  // 审核不通过
  async unAudit(e){
    let {verifyRemark} = this.data;
    let {id} = this.data.info;
    await util.postByBeanName('exceptionTF','verifyExceptionInfo',{id,type:2,verifyRemark});
    await wxApi.showModal("操作成功。");
    this.back();
  },
  // 审核通过
  async audit(e){
    let {confirm} = await wxApi.showModal({
      title:"提示",
      content:"您正在操作审核确认，是否继续？",
      showCancel:true
    })
    if(confirm){
      let {id} = this.data.info;
      await util.postByBeanName('exceptionTF','verifyExceptionInfo',{id,type:1});
      this.back();
    }
  },
  back(){
    let pageLength = getCurrentPages().length;
    if(pageLength>1){
      wx.navigateBack({
        delta:1
      })
    }else{
      wx.redirectTo({
        url: '/except/exceptManage/exceptManage',
      })
    }
  },
  // 提交
  async submit(){
    if(common.isBlank(this.data.info.lossFee)){
      wxApi.showToast("请填写财产损失金额！");
      return
    }
    await util.postByBeanName('exceptionTF','doneExceptionInfo',this.data.info);
    await wxApi.showModal("保存成功")
    wx.navigateBack({
      delta: 1,
    })
  },
})