import { H as Hls } from "./hls-vendor-dru42stk.js";

document.addEventListener("DOMContentLoaded", function () {
    var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));

    players.forEach(function (player) {
        var video = player.querySelector("video");
        var button = player.querySelector("[data-play-button]");
        var message = player.querySelector("[data-player-message]");
        var source = player.getAttribute("data-source") || (video && video.getAttribute("data-video-source"));
        var hlsInstance = null;
        var hasLoaded = false;

        function setMessage(text) {
            if (message) {
                message.textContent = text || "";
            }
        }

        function playVideo() {
            if (!video) {
                return;
            }

            if (!source) {
                setMessage("当前影片未配置播放源。");
                return;
            }

            player.classList.add("is-playing");
            video.setAttribute("controls", "controls");

            if (hasLoaded) {
                video.play().catch(function () {
                    setMessage("浏览器阻止自动播放，请再次点击播放器。");
                });
                return;
            }

            hasLoaded = true;
            setMessage("正在加载播放源...");

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
                video.addEventListener("loadedmetadata", function () {
                    setMessage("");
                    video.play().catch(function () {
                        setMessage("浏览器阻止自动播放，请再次点击播放器。");
                    });
                }, { once: true });
                return;
            }

            if (Hls && Hls.isSupported()) {
                hlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                    setMessage("");
                    video.play().catch(function () {
                        setMessage("浏览器阻止自动播放，请再次点击播放器。");
                    });
                });
                hlsInstance.on(Hls.Events.ERROR, function (_event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    setMessage("播放源加载失败，请刷新页面后重试。");
                    if (hlsInstance) {
                        hlsInstance.destroy();
                        hlsInstance = null;
                    }
                    hasLoaded = false;
                });
                return;
            }

            setMessage("当前浏览器不支持 HLS 播放。");
        }

        if (button) {
            button.addEventListener("click", playVideo);
        }

        if (video) {
            video.addEventListener("dblclick", playVideo);
        }
    });
});
