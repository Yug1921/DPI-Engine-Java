package dpi.rules;

import dpi.models.AppType;
import java.util.HashSet;
import java.util.Set;

public class RuleEngine {

    private Set<AppType> blockedApps = new HashSet<>();
    private Set<String> blockedIPs = new HashSet<>();
    private Set<String> blockedDomains = new HashSet<>();

    public void blockApp(String appName) {

        AppType type = AppType.fromString(appName);

        if (type != null) {

            blockedApps.add(type);

            System.out.println("[Rules] Blocked app: " + appName);
        }
    }

    public void blockIP(String ip) {

        blockedIPs.add(ip);

        System.out.println("[Rules] Blocked IP: " + ip);
    }

    public void blockDomain(String domain) {

        blockedDomains.add(domain);

        System.out.println("[Rules] Blocked domain: " + domain);
    }

    public boolean isBlocked(
            String srcIp,
            String sni,
            AppType app
    ) {

        if (blockedIPs.contains(srcIp))
            return true;

        if (blockedDomains.contains(sni))
            return true;

        if (blockedApps.contains(app))
            return true;

        return false;
    }
}