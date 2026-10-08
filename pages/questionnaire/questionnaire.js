import {util,wxApi,common,regeneratorRuntime} from '../../common/commonImport'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isEnd:false,
    info:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (query) {
    let scene = decodeURIComponent(query.scene);
    let putId = scene.replace("id=","");
    this.initData(putId);
  },
  async initData(putId){    
    let info = await util.postByBeanName('questionnaireService','loadQuestionnaireByPutId',{id:putId});
    info.startWords = info.startWords.replace(/\n/g,'\n');
    info.putId = putId;
    info.startDate = common.formatDate.getDateTime();
    this.setData({info});
  },
  //原生 - input赋值
  inputSetDataDefault(e){
    let {value} = e.detail;
    let { key } = e.currentTarget.dataset;
    this.setData({['info.'+key]:value});
  },
  // 标题input赋值
  inputSetDataTitle(e){
    let {value} = e.detail;
    let { key,index } = e.currentTarget.dataset;
    this.setData({['info.titleList['+index+'].'+key]:value});
  },
  // 标题radio赋值
  titleChange(e){
    let value = e.detail;
    let { key,index } = e.currentTarget.dataset;
    this.setData({['info.titleList['+index+'].'+key]:value});
  },
  // 子问题input赋值
  inputSetDataQues(e){
    let {value} = e.detail;
    let { key,index,innerindex } = e.currentTarget.dataset;
    this.setData({['info.titleList['+index+'].questionList['+innerindex+'].'+key]:value});
  },
  // 子问题radio赋值
  innerChange(e){
    let value = e.detail;
    let { key,index,innerindex } = e.currentTarget.dataset;
    this.setData({['info.titleList['+index+'].questionList['+innerindex+'].'+key]:value});
  },
  // 获取手机号
  async submit(){
    let res = await wxApi.login();
    let userInfo = await wxApi.getUserInfo(); //获取用户信息
    this.data.info.wxCode = res.code;
    this.data.info.endDate = common.formatDate.getDateTime();
    this.data.info.nickName = encodeURI(userInfo.userInfo.nickName);
    try{
      this.data.info.titleList.forEach(el => {
        el.questionList.forEach(item => {
          item.questionAnswer = encodeURI(item.questionAnswer);
        })
      })
    }catch(e){}
    await util.postByBeanName('answerService','saveOrUpdateAnswer',this.data.info);
    this.setData({isEnd:true})
  },
})