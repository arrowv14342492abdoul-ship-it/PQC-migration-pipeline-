import {
  KaliTool,
  KaliAuditScenario,
  KaliSystemStatus,
  KaliTerminalLine,
} from '../types/kaliLinux';
import {
  KALI_TOOL_SUITE,
  KALI_AUDIT_SCENARIOS,
  KALI_INITIAL_SYSTEM_STATUS,
} from '../data/kaliLinuxData';

class KaliLinuxService {
  private tools: KaliTool[] = KALI_TOOL_SUITE;
  private scenarios: KaliAuditScenario[] = KALI_AUDIT_SCENARIOS;
  private systemStatus: KaliSystemStatus = KALI_INITIAL_SYSTEM_STATUS;

  public getTools(): KaliTool[] {
    return this.tools;
  }

  public getScenarios(): KaliAuditScenario[] {
    return this.scenarios;
  }

  public getSystemStatus(): KaliSystemStatus {
    return this.systemStatus;
  }

  public getToolById(id: string): KaliTool | undefined {
    return this.tools.find((t) => t.id === id);
  }

  public executeCommand(rawCommand: string): KaliTerminalLine[] {
    const trimmed = rawCommand.trim();
    if (!trimmed) return [];

    const nowStr = new Date().toTimeString().split(' ')[0];
    const parts = trimmed.split(' ');
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Prompt line echo
    const promptLine: KaliTerminalLine = {
      id: `cmd-${Date.now()}-1`,
      type: 'prompt',
      content: `┌──(kali㉿kali)-[~]\n└─$ ${trimmed}`,
      timestamp: nowStr,
    };

    const outputLines: KaliTerminalLine[] = [promptLine];

    // Built-in Commands
    if (cmd === 'clear') {
      return [];
    } else if (cmd === 'help') {
      outputLines.push({
        id: `cmd-${Date.now()}-2`,
        type: 'output',
        content: `Kali Linux 2026.1 - Integrated Terminal & Security Suite
Available built-in commands:
  help                    - Display this command manual
  clear                   - Clear terminal buffer
  ls                      - List files in current directory
  pwd                     - Print current working directory
  whoami                  - Print effective user ID (kali)
  id                      - Print user and group IDs
  uname -a                - Display Linux kernel version and architecture
  neofetch                - Display Kali Linux system summary and ASCII art
  uptime                  - Display system running time and load averages
  ifconfig / ip addr      - Show active network interface configurations
  cat <file>              - Concatenate and display file content

Integrated Kali Security Suite Tools:
  nmap                    - Network exploration and SSL/TLS cipher enumeration
  tshark / wireshark      - Packet capture and post-quantum TLS inspection
  sslscan                 - Fast TLS/SSL cipher suite evaluator
  nikto                   - Web server vulnerability and misconfiguration scanner
  lynis                   - System hardening, CIS benchmarks & compliance auditor
  msfconsole              - Metasploit Framework interactive console
  john                    - Password cracking and cryptographic hash benchmarking
  aircrack-ng             - 802.11 wireless security suite
  ghidra                  - NSA software reverse engineering and decompiler
  binwalk                 - Firmware extraction and embedded key inspection
  volatility / vol        - Memory forensics framework
  sqlmap                  - Database assessment and SQL injection verification
  checksec                - Binary security exploit mitigation inspector`,
      });
      return outputLines;
    } else if (cmd === 'whoami') {
      outputLines.push({
        id: `cmd-${Date.now()}-2`,
        type: 'output',
        content: 'kali',
      });
      return outputLines;
    } else if (cmd === 'pwd') {
      outputLines.push({
        id: `cmd-${Date.now()}-2`,
        type: 'output',
        content: '/home/kali',
      });
      return outputLines;
    } else if (cmd === 'id') {
      outputLines.push({
        id: `cmd-${Date.now()}-2`,
        type: 'output',
        content: 'uid=1000(kali) gid=1000(kali) groups=1000(kali),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev),109(netdev),118(wireshark)',
      });
      return outputLines;
    } else if (cmd === 'uname') {
      outputLines.push({
        id: `cmd-${Date.now()}-2`,
        type: 'output',
        content: 'Linux kali 6.6.9-kali1-amd64 #1 SMP PREEMPT_DYNAMIC Kali 6.6.9-1kali1 (2026-02-01) x86_64 GNU/Linux',
      });
      return outputLines;
    } else if (cmd === 'uptime') {
      outputLines.push({
        id: `cmd-${Date.now()}-2`,
        type: 'output',
        content: ` 14:52:10 up 4 days, 16:28,  2 users,  load average: 0.12, 0.08, 0.05`,
      });
      return outputLines;
    } else if (cmd === 'ls') {
      outputLines.push({
        id: `cmd-${Date.now()}-2`,
        type: 'output',
        content: 'Desktop  Documents  Downloads  firmware_f35_sensor.bin  memory.raw  Music  Pictures  pqc_audit_results.log  Public  Templates  Videos',
      });
      return outputLines;
    } else if (cmd === 'ifconfig' || (cmd === 'ip' && args[0] === 'addr')) {
      outputLines.push({
        id: `cmd-${Date.now()}-2`,
        type: 'output',
        content: `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 10.0.4.15  netmask 255.255.255.0  broadcast 10.0.4.255
        inet6 fe80::a00:27ff:fe4a:38b2  prefixlen 64  scopeid 0x20<link>
        ether 08:00:27:4a:38:b2  txqueuelen 1000  (Ethernet)
        RX packets 84210  bytes 68421000 (65.2 MiB)
        TX packets 51200  bytes 41200000 (39.2 MiB)

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        loop  txqueuelen 1000  (Local Loopback)`,
      });
      return outputLines;
    } else if (cmd === 'neofetch') {
      outputLines.push({
        id: `cmd-${Date.now()}-2`,
        type: 'output',
        content: `       ............          kali@kali
      ..,;:ccc:,.            ---------
    ......''';lxO.           OS: Kali GNU/Linux Rolling 2026.1 x86_64
.....''''..........,:ldxdo:  Host: Quantum Defense Station
           .',;;:,,'..       Kernel: 6.6.9-kali1-amd64
      ..';cldkkdc,.          Uptime: 4 days, 16 hours, 28 mins
    .';codxxdoc;,...         Packages: 3842 (dpkg)
  .,clddolc;'..              Shell: zsh 5.9
 .,cooolc;'..                Terminal: qterminal
.;cooolc;'..                 CPU: AMD Ryzen 9 7950X (32) @ 4.500GHz
.;cooolc;'..                 GPU: NVIDIA RTX 4090 24GB
                             Memory: 4280MiB / 32768MiB (13%)`,
      });
      return outputLines;
    } else if (cmd === 'cat') {
      const filename = args[0] || '';
      if (filename.includes('pqc')) {
        outputLines.push({
          id: `cmd-${Date.now()}-2`,
          type: 'output',
          content: `# Post-Quantum Cryptography Audit Log - Kali Linux
[+] TARGET: 10.0.4.1:443 (Gateway)
[+] STATUS: Legacy RSA-2048 and ECDH-X25519 detected
[+] REMEDIATION: Upgrade to NIST FIPS 203 ML-KEM-768 hybrid KEM
[+] CBOM ENTRY: Created - Ready for Export to PQC Pipeline`,
        });
      } else {
        outputLines.push({
          id: `cmd-${Date.now()}-2`,
          type: 'output',
          content: `cat: ${filename || 'missing file'}: No such file or directory`,
        });
      }
      return outputLines;
    }

    // Match Tool in Kali Suite
    const matchedTool = this.tools.find(
      (t) => t.id === cmd || t.packageName === cmd || t.binaryPath.endsWith(`/${cmd}`)
    );

    if (matchedTool) {
      outputLines.push({
        id: `cmd-${Date.now()}-2`,
        type: 'output',
        content: matchedTool.sampleOutput,
      });

      outputLines.push({
        id: `cmd-${Date.now()}-3`,
        type: 'success',
        content: `[✓] Execution completed successfully with exit code 0. [PQC Insight: ${matchedTool.pqcRelevance.slice(0, 85)}...]`,
      });
      return outputLines;
    }

    // Unknown Command
    outputLines.push({
      id: `cmd-${Date.now()}-2`,
      type: 'error',
      content: `zsh: command not found: ${cmd}. Type 'help' to view all integrated Kali Linux tools and built-in commands.`,
    });
    return outputLines;
  }
}

export const kaliLinuxService = new KaliLinuxService();
