// ignore
import {} from '../../core/uzVideo.js';
import {} from '../../core/uzHome.js';
import {} from '../../core/uz3lib.js';
import {} from '../../core/uzUtils.js';
// ignore

class XHamsterAPI extends WebApiBase {
  constructor() {
    super();
    this.host = 'https://zh.xhamster.com'; // 主机地址
    this.webSite = 'https://zh.xhamster.com'; // 网站首页
    this.headers = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
      'Accept': 'application/json',
      'Referer': this.webSite,
      'X-Requested-With': 'XMLHttpRequest',
    };
  }

  /**
   * 获取分类列表
   * @returns {Promise<RepVideoClassList>}
   */
  async getClassList(args) {
    let backData = new RepVideoClassList();
    try {
      let categories = [
        { type_id: '/4k', type_name: '4K' },
        { type_id: '/categories', type_name: '类别' },
        { type_id: '/newest', type_name: '最新' },
        { type_id: '/best', type_name: '最佳' },
        { type_id: '/pornstars', type_name: '明星' },
      ];
      backData.data = categories;
    } catch (error) {
      backData.error = `分类列表获取失败: ${error}`;
    }
    return JSON.stringify(backData);
  }

  /**
   * 获取视频列表
   * @returns {Promise<RepVideoList>}
   */
  async getVideoList(args) {
    let backData = new RepVideoList();
    try {
      const page = args.page || 1;
      const tid = args.type_id || '/newest'; // 默认获取最新视频

      let url = `${this.host}${tid}/page/${page}`;
      let response = await req(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response || !response.data) {
        throw new Error('API 返回数据为空');
      }

      let data = response.data;
      let videos = this.getVideoListFromHTML(data);
      backData.data = videos;
    } catch (error) {
      backData.error = `获取视频列表失败: ${error.message}`;
    }
    return JSON.stringify(backData);
  }

  /**
   * 获取视频详情
   * @returns {Promise<RepVideoDetail>}
   */
  async getVideoDetail(args) {
    let backData = new RepVideoDetail();
    try {
      if (!args.vod_id) {
        throw new Error('视频ID为空');
      }

      let url = `${this.host}/video/${args.vod_id}`;
      let response = await req(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response || !response.data) {
        throw new Error('无法获取视频详情');
      }

      let data = response.data;
      backData = this.parseVideoDetail(data);
    } catch (error) {
      backData.error = `获取视频详情失败: ${error.message}`;
    }
    return JSON.stringify(backData);
  }

  /**
   * 获取视频播放地址
   * @returns {Promise<RepVideoPlayUrl>}
   */
  async getVideoPlayUrl(args) {
    let backData = new RepVideoPlayUrl();
    try {
      if (!args.vod_id) {
        throw new Error('视频ID为空');
      }

      let url = `${this.host}/video/${args.vod_id}`;
      let response = await req(url, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response || !response.data) {
        throw new Error('无法获取视频播放信息');
      }

      let data = response.data;
      let playUrl = this.extractPlayUrl(data);
      backData.data = playUrl;
    } catch (error) {
      backData.error = `获取播放地址失败: ${error.message}`;
    }
    return JSON.stringify(backData);
  }

  /**
   * 搜索视频
   * @returns {Promise<RepVideoList>}
   */
  async searchVideo(args) {
    let backData = new RepVideoList();
    try {
      if (!args.searchWord) {
        throw new Error('搜索关键词为空');
      }

      let searchUrl = `${this.host}/search/${encodeURIComponent(args.searchWord)}?page=${args.page || 1}`;
      let response = await req(searchUrl, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response || !response.data) {
        throw new Error('无法获取搜索页面 HTML');
      }

      let data = response.data;
      let searchResults = this.getSearchResultsFromHTML(data);
      backData.data = searchResults;
    } catch (error) {
      backData.error = `搜索失败: ${error.message}`;
    }
    return JSON.stringify(backData);
  }

  // 解析视频列表
  getVideoListFromHTML(html) {
    let videoElements = parse(html).querySelectorAll('.video-item');
    return Array.from(videoElements).map(element => {
      return {
        vod_id: element.querySelector('a').getAttribute('href').split('/').pop(),
        vod_name: element.querySelector('img').getAttribute('alt'),
        vod_pic: element.querySelector('img').getAttribute('src'),
        vod_remarks: element.querySelector('.duration').textContent,
      };
    });
  }

  // 解析视频详情
  parseVideoDetail(html) {
    let document = parse(html);
    return {
      vod_name: document.querySelector('h1.title').textContent,
      vod_pic: document.querySelector('img.thumbnail').getAttribute('src'),
      vod_remarks: document.querySelector('.duration').textContent,
      vod_play_url: this.extractPlayUrl(document),
    };
  }

  // 提取播放地址
  extractPlayUrl(html) {
    let playUrl = document.querySelector('video').getAttribute('src');
    return playUrl || '';
  }

  // 从搜索结果中提取信息
  getSearchResultsFromHTML(html) {
    let videoElements = parse(html).querySelectorAll('.search-result-item');
    return Array.from(videoElements).map(element => {
      return {
        vod_id: element.querySelector('a').getAttribute('href').split('/').pop(),
        vod_name: element.querySelector('img').getAttribute('alt'),
        vod_pic: element.querySelector('img').getAttribute('src'),
        vod_remarks: element.querySelector('.duration').textContent,
      };
    });
  }
}
// json 中 instance 的值，这个名称一定要特殊
var xhm20250219 = new xhm20250219();
