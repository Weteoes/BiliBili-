(function () {
    'use strict';
    var bilibili_options = null;
    function Main() {
        chrome.storage.sync.get("console_options", function (console_options) {
            for (let i of console_options.console_options) {
                if (i.name == "bilibili") {
                    bilibili_options = i;
                    log("脚本初始化完毕");
                    break;
                }
            }
            w_Main();
        });
    }
    function w_Main() {
        if (!PD_Type() && !PD_URL()) { log("非视频播放页面"); return; }
        PD_Success();
    }
    function PD_URL() {
        let url = location.href;
        if (url.indexOf("www.bilibili.com/watchlater") != -1) { return true; }
        return false;
    }
    function PD_Type() {
        let meta = document.querySelector("meta[property='og:type']");
        if (meta == null) { return false; }
        let type = meta.content;
        if (type == undefined) { return false; }
        if (type.indexOf("video") == -1) { return false; }
        log("视频播放类型:" + type);
        return true;
    }
    function PD_Success() {
        if (document.querySelector(".bilibili-player-video-control") == null) { setTimeout(PD_Success, 60); return; }
        let time = document.querySelector(".bilibili-player-video-time-total");
        if (time == null) { setTimeout(PD_Success, 60); return; }
        log("视频初始化成功");
        Function();
    }
    function Function() {
        try {
            // 全局开关
            var bilibili_options_on = bilibili_options.options.find((data) => data.key == "bilibili_options_on").status; 
            for (let i of bilibili_options.options) {
                 // 如果全局开关关了就退出循环
                if (!bilibili_options_on) { 
                    log("全局开关关闭");
                    break;
                 }
                switch (i.key) {
                    case "bilibili_options_autoWidescreen": // 自动打开宽屏
                        if (i.status) { options_autoWidescreen(); }
                        break;
                    case "bilibili_options_autoPlay": // 自动播放
                        if (i.status) { options_autoPlay(); }
                        break;
                    case "bilibili_options_autoPlayContinue": // 自动继续播放
                        if (i.status) { options_autoPlayContinue(); }
                        break;
                }
            }
            URL();
        }
        catch(e) {
            log(e);
        }
    }
    // 宽屏模式
    function options_autoWidescreen() {
        let a = document.querySelector("[data-text=宽屏模式]");
        if (a == null) { log("宽屏模式打开失败"); return; }
        if (a.parentNode.classList.contains("closed")) { log("宽屏模式已经打开，无需操作"); return; }
        a.click();
        log("宽屏模式打开成功");
    }
    // 自动播放
    function options_autoPlay() { // setTimeout
        function BA() {
            let b = document.querySelector(".bilibili-player-video-btn-start");
            if (b == null) { log("播放视频失败 -2"); return; }
            if (b.classList.contains("video-state-pause")) { setTimeout(options_autoPlay, 100); return false; }
            log("播放视频成功");
            return true;
        }
        let a = document.querySelector("video");
        if (a == null) { log("播放视频失败 -1"); return; }
        a.click();
        setTimeout(BA, 100);
    }
    // 继续播放
    function options_autoPlayContinue() {
        let i = 0;
        let Continue = () => {
            let RestartContinue = () => { setTimeout(Continue, 300); }
            let toast = document.querySelector(".bilibili-player-video-toast-item");
            if (toast == null) {
                i++;
                if (i < 10) { RestartContinue(); }
                else { log("未检测到上次播放记录,检测次数:" + i); }
                return;
            }
            log("检测到上次播放记录,检测次数:" + i);
            let msg = toast.querySelector(".bilibili-player-video-toast-item-text");
            let msg_title = msg.querySelector("span").innerText;
            let jump = toast.querySelector(".bilibili-player-video-toast-item-jump");
            log("检测到上次播放记录标题:" + msg_title);
            if (msg_title == "上次看到") {
                log("检测到上次播放记录为同一视频,正在跳转...");
                jump.click();
            } else { log("检测到上次播放记录为不同视频,不自动跳转"); }
        }
        Continue();
    }
    // 监听URL(视频)
    function URL() {
        let lastURL = location.href;
        function A() {
            let nowURL = location.href;
            if (lastURL == nowURL) { return; }
            lastURL = nowURL;
            log("页面已经切换");
            w_Main();
        }
        setInterval(A, 100);
    }
    function log(...data) {
        console.log("BiliBili-默认观看脚本:", new Date().toLocaleString(), ...data);
    }
    Main();
})();