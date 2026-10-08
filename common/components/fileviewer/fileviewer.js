import {common, wxApi} from '../../commonImport'
Component({
  properties: {
    url: String,
    style: String,
  },
  ready(){
    let isImg = false;
    let fileType = null;
    if(/\.pdf$/i.test(this.data.url)){
      fileType = 'pdf';
    }else if(/\.xls$/i.test(this.data.url)){
      fileType = 'xls';
    }else if(/\.xlsx$/i.test(this.data.url)){
      fileType = 'xlsx';
    }else if(/\.doc$/i.test(this.data.url)){
      fileType = 'doc';
    }else if(/\.docx$/i.test(this.data.url)){
      fileType = 'docx';
    }else if(/\.(?:jpeg|jpg|gif|png|bmp|webp)$/i.test(this.data.url)){
      isImg = true;
    }else{
      fileType = 'file'
    }
    this.setData({isImg,fileType})
  },
  methods: {
    // 访问文件地址
    visitFile(e){
      let {url,isImg,fileType} = this.data;
      if(isImg){
        this.seeBigImg()
      }else if(fileType == 'file'){
        wxApi.showToast("该类型不支持预览。")
      }else{
        this.visitPDF(url)
      }
    },
    /**
     * 查看大图
     */
    seeBigImg(){
      let url = common.getBigImgPath(this.data.url)
      wx.previewImage({
        current:url,
        urls:[url], // 需要预览的图片http链接列表
      })
    },
    // 查看pdf文档
    visitPDF(url){
      wx.showLoading();
      let fileType = this.data.fileType;

      console.log('开发者收集你选中的文件，用于查看文件。')
      wx.downloadFile({
        // 示例 url，并非真实存在
        url,
        success: function (res) {
          const filePath = res.tempFilePath
          console.log(res)
          wx.openDocument({
            filePath: filePath,
            fileType: fileType,
            showMenu:true,
            success: function (res) {
              wx.hideLoading();
              console.log('打开文档成功')
            },
            fail(res){
              wx.hideLoading();
              console.log(res);
            }
          })
        },
        fail(){        
          wx.hideLoading();
        },
      })
    },
  }
});
