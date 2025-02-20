var rule = {
    title: 'xHamster', // 视频源名称
    host: 'https://zh.xhamster.com', // 网站域名
    url: '/categories/fyclass?page=fypage', // 分类URL模板
    searchUrl: '/search/**?page=fypage', // 搜索URL模板
    searchable: 2, // 支持搜索（2表示支持分页）
    quickSearch: 1, // 支持快速搜索
    filterable: 0, // 是否支持筛选（暂不支持）
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    },
    timeout: 5000, // 请求超时（毫秒）
    class_name: '热门&最新&推荐', // 分类名称
    class_url: 'popular&new&trending', // 分类URL参数
    play_parse: false, // 是否需要解析播放链接
    lazy: '', // 懒加载脚本（暂无）
    limit: 6, // 每页视频数量限制

    // 初始化
    init: function(cfg) {
        rule.host = cfg.host || rule.host;
    },

    // 主页推荐内容
    home: function(filter) {
        let html = req(rule.host, { headers: rule.headers });
        let $ = html(html); // 解析HTML
        let videos = [];
        $('.video-thumb').each(function() {
            let $this = $(this);
            videos.push({
                vod_id: $this.find('a').attr('href'),
                vod_name: $this.find('.video-thumb__title').text().trim(),
                vod_pic: $this.find('img').attr('src'),
                vod_remarks: $this.find('.video-thumb__duration').text().trim()
            });
        });
        return JSON.stringify({
            class: rule.class_name.split('&').map((name, i) => ({
                type_id: rule.class_url.split('&')[i],
                type_name: name
            })),
            list: videos
        });
    },

    // 主页推荐视频（与home类似，但只返回视频列表）
    homeVod: function() {
        let html = req(rule.host, { headers: rule.headers });
        let $ = html(html);
        let videos = [];
        $('.video-thumb').each(function() {
            let $this = $(this);
            videos.push({
                vod_id: $this.find('a').attr('href'),
                vod_name: $this.find('.video-thumb__title').text().trim(),
                vod_pic: $this.find('img').attr('src'),
                vod_remarks: $this.find('.video-thumb__duration').text().trim()
            });
        });
        return JSON.stringify({ list: videos });
    },

    // 分类页面
    category: function(tid, pg, filter, extend) {
        pg = pg || 1;
        let url = rule.host + rule.url.replace('fyclass', tid).replace('fypage', pg);
        let html = req(url, { headers: rule.headers });
        let $ = html(html);
        let videos = [];
        $('.video-thumb').each(function() {
            let $this = $(this);
            videos.push({
                vod_id: $this.find('a').attr('href'),
                vod_name: $this.find('.video-thumb__title').text().trim(),
                vod_pic: $this.find('img').attr('src'),
                vod_remarks: $this.find('.video-thumb__duration').text().trim()
            });
        });
        return JSON.stringify({
            page: parseInt(pg),
            pagecount: 999, // 假设有很多页，实际需要解析分页
            limit: rule.limit,
            total: 999 * rule.limit, // 总数未知，占位符
            list: videos
        });
    },

    // 视频详情
    detail: function(id) {
        let url = rule.host + id;
        let html = req(url, { headers: rule.headers });
        let $ = html(html);
        let video = {
            vod_id: id,
            vod_name: $('h1').text().trim(), // 标题
            vod_pic: $('.video-container img').attr('src') || $('.thumb-image-container img').attr('src'), // 封面
            vod_play_from: 'xHamster', // 播放源
            vod_play_url: $('#player source').attr('src') || $('#player').attr('data-video-url') || '', // 播放链接
            vod_remarks: $('.duration').text().trim() || ''
        };
        return JSON.stringify({ list: [video] });
    },

    // 播放链接
    play: function(flag, id, flags) {
        return JSON.stringify({
            parse: 0, // 不需要额外解析
            url: id // 直接返回播放URL
        });
    },

    // 搜索
    search: function(wd, quick, pg) {
        pg = pg || 1;
        let url = rule.host + rule.searchUrl.replace('**', encodeURIComponent(wd)).replace('fypage', pg);
        let html = req(url, { headers: rule.headers });
        let $ = html(html);
        let videos = [];
        $('.video-thumb').each(function() {
            let $this = $(this);
            videos.push({
                vod_id: $this.find('a').attr('href'),
                vod_name: $this.find('.video-thumb__title').text().trim(),
                vod_pic: $this.find('img').attr('src'),
                vod_remarks: $this.find('.video-thumb__duration').text().trim()
            });
        });
        return JSON.stringify({
            page: parseInt(pg),
            pagecount: 999, // 假设有很多页
            limit: rule.limit,
            total: 999 * rule.limit,
            list: videos
        });
    }
};
