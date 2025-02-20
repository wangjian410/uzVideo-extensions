var rule = {
    title: 'xHamster',
    host: 'https://zh.xhamster.com',
    url: '/categories/fyclass/fysort/fypage', // 更新分类URL模板
    searchUrl: '/search/**?page=fypage',
    searchable: 2,
    quickSearch: 1,
    filterable: 0,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://zh.xhamster.com/' // 添加Referer防反爬
    },
    timeout: 5000,
    class_name: '热门&最新&推荐',
    class_url: 'popular&new&trending',
    play_parse: false,
    lazy: '',
    limit: 6,

    // 初始化
    init: function(cfg) {
        rule.host = cfg.host || rule.host;
    },

    // 主页推荐内容
    home: function(filter) {
        let html = req(rule.host, { headers: rule.headers });
        print('主页HTML长度: ' + html.length); // 调试：检查HTML是否为空
        if (!html) return JSON.stringify({ list: [] });

        let $ = html(html);
        let videos = [];
        $('.thumb-list__item').each(function() { // 更新选择器
            let $this = $(this);
            let link = $this.find('a').attr('href');
            let title = $this.find('.video-thumb-info__name').text().trim();
            let pic = $this.find('img').attr('src');
            let remarks = $this.find('.thumb-image-container__duration').text().trim();
            if (link && title) { // 确保关键字段不为空
                videos.push({
                    vod_id: link,
                    vod_name: title,
                    vod_pic: pic,
                    vod_remarks: remarks
                });
            }
        });
        print('主页找到视频数: ' + videos.length); // 调试：检查视频数量
        return JSON.stringify({
            class: rule.class_name.split('&').map((name, i) => ({
                type_id: rule.class_url.split('&')[i],
                type_name: name
            })),
            list: videos
        });
    },

    // 主页推荐视频
    homeVod: function() {
        let html = req(rule.host, { headers: rule.headers });
        let $ = html(html);
        let videos = [];
        $('.thumb-list__item').each(function() {
            let $this = $(this);
            videos.push({
                vod_id: $this.find('a').attr('href'),
                vod_name: $this.find('.video-thumb-info__name').text().trim(),
                vod_pic: $this.find('img').attr('src'),
                vod_remarks: $this.find('.thumb-image-container__duration').text().trim()
            });
        });
        return JSON.stringify({ list: videos });
    },

    // 分类页面
    category: function(tid, pg, filter, extend) {
        pg = pg || 1;
        let sort = 'best'; // 默认排序，可根据需要调整
        let url = rule.host + rule.url.replace('fyclass', tid).replace('fysort', sort).replace('fypage', pg);
        let html = req(url, { headers: rule.headers });
        print('分类页URL: ' + url); // 调试
        let $ = html(html);
        let videos = [];
        $('.thumb-list__item').each(function() {
            let $this = $(this);
            videos.push({
                vod_id: $this.find('a').attr('href'),
                vod_name: $this.find('.video-thumb-info__name').text().trim(),
                vod_pic: $this.find('img').attr('src'),
                vod_remarks: $this.find('.thumb-image-container__duration').text().trim()
            });
        });
        return JSON.stringify({
            page: parseInt(pg),
            pagecount: 999, // 待优化
            limit: rule.limit,
            total: 999 * rule.limit,
            list: videos
        });
    },

    // 视频详情
    detail: function(id) {
        let url = rule.host + id;
        let html = req(url, { headers: rule.headers });
        let $ = html(html);
        let playUrl = $('#player source').attr('src') || $('meta[property="og:video"]').attr('content') || '';
        let video = {
            vod_id: id,
            vod_name: $('h1').text().trim(),
            vod_pic: $('.video-container img').attr('src') || $('meta[property="og:image"]').attr('content'),
            vod_play_from: 'xHamster',
            vod_play_url: playUrl,
            vod_remarks: $('.duration').text().trim() || ''
        };
        print('播放链接: ' + playUrl); // 调试
        return JSON.stringify({ list: [video] });
    },

    // 播放链接
    play: function(flag, id, flags) {
        return JSON.stringify({
            parse: 0,
            url: id
        });
    },

    // 搜索
    search: function(wd, quick, pg) {
        pg = pg || 1;
        let url = rule.host + rule.searchUrl.replace('**', encodeURIComponent(wd)).replace('fypage', pg);
        let html = req(url, { headers: rule.headers });
        let $ = html(html);
        let videos = [];
        $('.thumb-list__item').each(function() {
            let $this = $(this);
            videos.push({
                vod_id: $this.find('a').attr('href'),
                vod_name: $this.find('.video-thumb-info__name').text().trim(),
                vod_pic: $this.find('img').attr('src'),
                vod_remarks: $this.find('.thumb-image-container__duration').text().trim()
            });
        });
        return JSON.stringify({
            page: parseInt(pg),
            pagecount: 999,
            limit: rule.limit,
            total: 999 * rule.limit,
            list: videos
        });
    }
};
