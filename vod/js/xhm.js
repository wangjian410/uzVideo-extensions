// ignore
import {} from '../../core/uzVideo.js';
import {} from '../../core/uzHome.js';
import {} from '../../core/uz3lib.js';
import {} from '../../core/uzUtils.js';
// ignore

class XHamsterAPI extends WebApiBase {
  constructor() {
    super();
    this.host = 'https://zh.xhamster.com/x-api'; // API 请求地址
    this.webSite = 'https://zh.xhamster.com'; // 网站首页
    this.headers = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Content-Type': 'application/json',
      'Accept': '*/*',
      'Referer': this.webSite,
      'X-Requested-With': 'XMLHttpRequest',
    };
  }

  /**
   * 获取分类列表
   * @param {UZArgs} args
   * @returns {Promise<RepVideoClassList>}
   */
  async getClassList(args) {
    let backData = new RepVideoClassList();
    try {
      // xhamster 没有标准的分类 API，可能需要手动填写分类
      let categories = [
        { type_id: 'straight', type_name: '直男' },
        { type_id: 'gay', type_name: '同性' },
        { type_id: 'trans', type_name: '变性' },
        { type_id: 'amateur', type_name: '素人' },
      ];
      backData.data = categories;
    } catch (error) {
      backData.error = '获取分类失败';
    }
    return JSON.stringify(backData);
  }

  /**
   * 获取分类视频列表
   * @param {UZArgs} args
   * @returns {Promise<RepVideoList>}
   */
  async getVideoList(args) {
    let backData = new RepVideoList();
    try {
      const response = await req(this.host, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          category: args.type_id, // 分类 ID
          limit: 20,
          page: args.page || 1,
        }),
      });

      let data = response.data;
      if (data && data.videos) {
        let videos = [];
        for (let video of data.videos) {
          let videoDet = new VideoDetail();
          videoDet.vod_id = video.id;
          videoDet.vod_name = video.title;
          videoDet.vod_pic = video.thumbnail_url;
          videoDet.vod_remarks = video.duration;
          videos.push(videoDet);
        }
        backData.data = videos;
      }
    } catch (error) {
      backData.error = '获取视频列表失败';
    }
    return JSON.stringify(backData);
  }

  /**
   * 获取视频详情
   * @param {UZArgs} args
   * @returns {Promise<RepVideoDetail>}
   */
  async getVideoDetail(args) {
    let backData = new RepVideoDetail();
    try {
      const response = await req(this.host, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          video_id: args.vod_id,
        }),
      });

      let data = response.data;
      if (data && data.video) {
        let video = data.video;
        backData.vod_id = video.id;
        backData.vod_name = video.title;
        backData.vod_pic = video.thumbnail_url;
        backData.vod_content = video.description || '暂无简介';
      }
    } catch (error) {
      backData.error = '获取视频详情失败';
    }
    return JSON.stringify(backData);
  }

  /**
   * 获取视频播放地址
   * @param {UZArgs} args
   * @returns {Promise<RepVideoPlayUrl>}
   */
  async getVideoPlayUrl(args) {
    let backData = new RepVideoPlayUrl();
    try {
      const response = await req(this.host, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          video_id: args.vod_id,
        }),
      });

      let data = response.data;
      if (data && data.video) {
        backData.data = data.video.play_url;
      }
    } catch (error) {
      backData.error = '获取播放地址失败';
    }
    return JSON.stringify(backData);
  }

  /**
   * 搜索视频
   * @param {UZArgs} args
   * @returns {Promise<RepVideoList>}
   */
  async searchVideo(args) {
    let backData = new RepVideoList();
    try {
      const response = await req(this.host, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          keyword: args.searchWord,
          limit: 20,
        }),
      });

      let data = response.data;
      if (data && data.videos) {
        let videos = [];
        for (let video of data.videos) {
          let videoDet = new VideoDetail();
          videoDet.vod_id = video.id;
          videoDet.vod_name = video.title;
          videoDet.vod_pic = video.thumbnail_url;
          videoDet.vod_remarks = video.duration;
          videos.push(videoDet);
        }
        backData.data = videos;
      }
    } catch (error) {
      backData.error = '搜索失败';
    }
    return JSON.stringify(backData);
  }
}

// json 中 instance 的值，这个名称要唯一
var xhm20250219 = new xhm20250219();
