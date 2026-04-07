import dpi.engine.DPIEngine;
import dpi.rules.RuleEngine;

public class Main {

    public static void main(String[] args) {

        if (args.length < 2) {
            System.out.println(
                    "Usage:\n" +
                    "java Main input.pcap output.pcap " +
                    "[--block-app YouTube] " +
                    "[--block-ip 192.168.1.50] " +
                    "[--block-domain example.com] " +
                    "[--max-packets 1000]"
            );
            return;
        }

        String inputFile = args[0];
        String outputFile = args[1];

        RuleEngine rules = new RuleEngine();
        int maxPackets = -1; // -1 means no limit

        // Parse optional flags
        for (int i = 2; i < args.length; i++) {
            String arg = args[i];

            switch (arg) {
                case "--block-app":
                    if (i + 1 < args.length) {
                        rules.blockApp(args[++i]);
                    } else {
                        System.err.println("Missing value for --block-app");
                        return;
                    }
                    break;

                case "--block-ip":
                    if (i + 1 < args.length) {
                        rules.blockIP(args[++i]);
                    } else {
                        System.err.println("Missing value for --block-ip");
                        return;
                    }
                    break;

                case "--block-domain":
                    if (i + 1 < args.length) {
                        rules.blockDomain(args[++i]);
                    } else {
                        System.err.println("Missing value for --block-domain");
                        return;
                    }
                    break;

                case "--max-packets":
                    if (i + 1 < args.length) {
                        try {
                            maxPackets = Integer.parseInt(args[++i]);
                            if (maxPackets <= 0) {
                                maxPackets = -1;
                            }
                        } catch (NumberFormatException e) {
                            System.err.println("Invalid number for --max-packets");
                            return;
                        }
                    } else {
                        System.err.println("Missing value for --max-packets");
                        return;
                    }
                    break;

                default:
                    System.err.println("Unknown option: " + arg);
                    break;
            }
        }

        try {
            printBanner();

            DPIEngine engine = new DPIEngine(rules);

            // IMPORTANT: requires DPIEngine overload with (input, output, maxPackets)
            engine.run(inputFile, outputFile, maxPackets);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private static void printBanner() {

        System.out.println();

        System.out.println("╔══════════════════════════════════════════════════════════════╗");
        System.out.println("║              DPI ENGINE v2.0 (Java)                        ║");
        System.out.println("╚══════════════════════════════════════════════════════════════╝");

        System.out.println();
    }
}