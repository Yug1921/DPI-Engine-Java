package dpi.classifier;

import dpi.models.AppType;

public class AppClassifier {

    public static AppType sniToAppType(String sni) {

        if (sni == null || sni.isEmpty()) {
            return AppType.UNKNOWN;
        }

        String lower = sni.toLowerCase();

        // Google
        if (lower.contains("google") ||
            lower.contains("gstatic") ||
            lower.contains("googleapis") ||
            lower.contains("ggpht") ||
            lower.contains("gvt1")) {
            return AppType.GOOGLE;
        }

        // YouTube
        if (lower.contains("youtube") ||
            lower.contains("ytimg") ||
            lower.contains("youtu.be") ||
            lower.contains("yt3.ggpht")) {
            return AppType.YOUTUBE;
        }

        // Facebook
        if (lower.contains("facebook") ||
            lower.contains("fbcdn") ||
            lower.contains("fb.com") ||
            lower.contains("fbsbx") ||
            lower.contains("meta.com")) {
            return AppType.FACEBOOK;
        }

        // Instagram
        if (lower.contains("instagram") ||
            lower.contains("cdninstagram")) {
            return AppType.INSTAGRAM;
        }

        // WhatsApp
        if (lower.contains("whatsapp") ||
            lower.contains("wa.me")) {
            return AppType.WHATSAPP;
        }

        // Twitter/X
        if (lower.contains("twitter") ||
            lower.contains("twimg") ||
            lower.equals("x.com") ||
            lower.contains(".x.com") ||
            lower.contains("t.co")) {
            return AppType.TWITTER;
        }

        // Netflix
        if (lower.contains("netflix") ||
            lower.contains("nflxvideo") ||
            lower.contains("nflximg")) {
            return AppType.NETFLIX;
        }

        // Amazon
        if (lower.contains("amazon") ||
            lower.contains("amazonaws") ||
            lower.contains("cloudfront") ||
            lower.contains("aws")) {
            return AppType.AMAZON;
        }

        // Microsoft
        if (lower.contains("microsoft") ||
            lower.contains("msn.com") ||
            lower.contains("office") ||
            lower.contains("azure") ||
            lower.contains("live.com") ||
            lower.contains("outlook") ||
            lower.contains("bing")) {
            return AppType.MICROSOFT;
        }

        // Apple
        if (lower.contains("apple") ||
            lower.contains("icloud") ||
            lower.contains("mzstatic") ||
            lower.contains("itunes")) {
            return AppType.APPLE;
        }

        // Telegram
        if (lower.contains("telegram") ||
            lower.contains("t.me")) {
            return AppType.TELEGRAM;
        }

        // TikTok
        if (lower.contains("tiktok") ||
            lower.contains("tiktokcdn") ||
            lower.contains("musical.ly") ||
            lower.contains("bytedance")) {
            return AppType.TIKTOK;
        }

        // Spotify
        if (lower.contains("spotify") ||
            lower.contains("scdn.co")) {
            return AppType.SPOTIFY;
        }

        // Zoom
        if (lower.contains("zoom")) {
            return AppType.ZOOM;
        }

        // Discord
        if (lower.contains("discord") ||
            lower.contains("discordapp")) {
            return AppType.DISCORD;
        }

        // GitHub
        if (lower.contains("github") ||
            lower.contains("githubusercontent")) {
            return AppType.GITHUB;
        }

        // Cloudflare
        if (lower.contains("cloudflare") ||
            lower.contains("cf-")) {
            return AppType.CLOUDFLARE;
        }

        return AppType.HTTPS;
    }
}