import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isShowDataPopover:false,
    isShowOrgPopover:false,
    isShowStaffPopover:false,
    fileList:[],
    realList:[],
    info:{},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function ({info}) {
    info = JSON.parse(decodeURI(info));
    info.num = info.nums;
    this.setData({info});
    this.queryData();
  },
  // 查询下拉框数据
  async queryData(){
    let orgList = await util.postByBeanName('regionOrgTF','getOrgInfoList');
    let staffList = await util.postByBeanName('regionOrgTF','queryStaffData');
    this.setData({orgList,orgListCache:orgList,staffList,staffListCache:staffList});
  },
  
  //原生 - input赋值
  inputSetDataDefault(e){
    let {value} = e.detail;
    let { key } = e.currentTarget.dataset;
    this.setData({['info.'+key]:value});
  },
  inputSetDataItem(e){
    let {value} = e.detail;
    let { key,index } = e.currentTarget.dataset;
    this.setData({['dtlList['+index+'].'+key]:value});
  },
  
  // 领用部门列表 - popover
  showOrgPopover(){
    this.setData({isShowOrgPopover:true})
  },
  /**
   * 选择领用部门
   */
  selectOrg(e){
    let { item } = e.currentTarget.dataset;
    this.setData({ 
      isShowOrgPopover:false,
      ['info.orgId']:item.id,
      ['info.orgName']:item.orgName,
    })
  },
  // 筛选领用部门列表 - popver
  searchOrgList(e){
    let value = e.detail.value;
    this.setData({ orgSearch: value });
    //延迟查询
    if (this.data.searchTimeout) clearTimeout(this.data.searchTimeout);
    this.data.searchTimeout = setTimeout(async () => {
      let orgList = [];
      this.data.orgListCache.forEach(el => {
        if(el.orgName.indexOf(value) > -1){
          orgList.push(el);
        }
      })
      this.setData({orgList});
      clearTimeout(this.data.searchTimeout);
    }, 300)
  },

  // 领用人员列表 - popover
  showStaffPopover(){
    this.setData({isShowStaffPopover:true})
  },
  /**
   * 选择领用人员
   */
  selectStaff(e){
    let { item } = e.currentTarget.dataset;
    this.setData({ 
      isShowStaffPopover:false,
      ['info.userId']:item.id,
      ['info.staffName']:item.staffName,
    })
  },
  // 筛选领用人员列表 - popver
  searchStaffList(e){
    let value = e.detail.value;
    this.setData({ staffSearch: value });
    //延迟查询
    if (this.data.searchTimeout) clearTimeout(this.data.searchTimeout);
    this.data.searchTimeout = setTimeout(async () => {
      let staffList = [];
      this.data.staffListCache.forEach(el => {
        if(el.staffName.indexOf(value) > -1){
          staffList.push(el);
        }
      })
      this.setData({staffList});
      clearTimeout(this.data.searchTimeout);
    }, 300)
  },

  // 上传固定资产标识卡
  async afterRead(event) {
    wx.showLoading();
    const { file } = event.detail;
    let {data} = await util.uploadFile(file);
    wx.hideLoading();
    data = JSON.parse(data);  //数据转化
    let fileList = [];
    let obj = {};
    obj.url = common.getBigImgPath(data.content.fullPath);
    fileList.push(obj);
    this.setData({
      ['info.flowId']:data.content.flowId,
      ['info.storePath']:data.content.storePath,
      fileList,
    })
  },
  // 删除固定资产标识卡
  deleteImg(){
    this.setData({
      ['info.flowId']:'',
      ['info.storePath']:'',
      fileList:[],
    })
  },

  async sure(){
    let {orgId,userId} = this.data.info;
    if(common.isBlank(orgId)){
      wxApi.showToast("请选择领用部门！");
      return
    }
    if(common.isBlank(userId)){
      wxApi.showToast("请选择领用人员！");
      return
    }
    let {confirm} = await wxApi.showModal({
      title:"提示",
      content:"您正在操作领用申请确认，是否继续？",
      showCancel:true
    })
    if(confirm){
      this.data.info.dtlList = this.data.dtlList;
      await util.postByBeanName('purStockService','saveConsuming',this.data.info);
      await wxApi.showModal("领用成功")
      wx.navigateBack({
        delta: 1,
      })
    }
  },
})