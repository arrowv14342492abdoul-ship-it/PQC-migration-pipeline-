import {
  KaliTool,
  KaliAuditScenario,
  KaliSystemStatus,
} from '../types/kaliLinux';

export const KALI_TERMINAL_BANNER = `
               ......                               
            .dK000000Kx.                            
          .d000000000000d.                          
         .k00000000000000k.                         
         d0000000000000000d                         
        .000000000000000000.                        
        :000000000000000000:       KALI LINUX 2026.1
        '000000000000000000'       The Most Advanced Penetration Testing
        .000000000000000000.       & Cryptographic Audit Platform
         d0000000000000000d        6.6.9-kali-amd64 #1 SMP PREEMPT
         .k00000000000000k.        Ready for Quantum Defense & PQC Audits
          .d000000000000d.                          
            .dK000000Kx.                            
               ......                               
`;

export const KALI_INITIAL_SYSTEM_STATUS: KaliSystemStatus = {
  distribution: 'Kali GNU/Linux Rolling 2026.1',
  kernelVersion: 'Linux 6.6.9-kali1-amd64',
  architecture: 'x86_64',
  uptime: '4 days, 16 hours, 28 mins',
  memoryUsageMb: 4280,
  totalMemoryMb: 32768,
  packagesInstalled: 3842,
  activeInterface: 'eth0 (10.0.4.15/24)',
  ipAddress: '10.0.4.15',
  metapackageStatus: 'kali-linux-everything (Full Suite Active)',
};

export const KALI_TOOL_SUITE: KaliTool[] = [
  {
    id: 'nmap',
    name: 'Nmap (Network Mapper)',
    category: 'Information Gathering',
    packageName: 'nmap',
    binaryPath: '/usr/bin/nmap',
    version: '7.94-1kali1',
    license: 'Nmap Public Source License (NPSL)',
    metapackage: 'kali-linux-default',
    summary:
      'Industry-standard network exploration tool and security scanner for host discovery, port scanning, OS detection, and vulnerability scripting.',
    defensiveUseCase:
      'Inventorying enterprise network perimeters, auditing open listening ports, validating firewall rule enforcement, and analyzing TLS cryptographic cipher support across exposed endpoints.',
    pqcRelevance:
      'Nmap NSE script `ssl-enum-ciphers` reveals servers that still rely on RSA-2048 key exchange (vulnerable to Shor’s algorithm) instead of post-quantum hybrid KEMs.',
    defaultCommand: 'nmap -sV -sC --script ssl-enum-ciphers 10.0.4.1',
    supportedFlags: [
      { flag: '-sV', description: 'Probe open ports to determine service/version info', example: 'nmap -sV target' },
      { flag: '-sC', description: 'Equivalent to --script=default', example: 'nmap -sC target' },
      { flag: '--script ssl-enum-ciphers', description: 'Enumerate supported SSL/TLS ciphers and rating', example: 'nmap -p 443 --script ssl-enum-ciphers target' },
      { flag: '-p-', description: 'Scan all 65,535 TCP ports', example: 'nmap -p- target' },
    ],
    sampleOutput: `Starting Nmap 7.94 ( https://nmap.org ) at 2026-10-11 14:48 UTC
Nmap scan report for secure-gateway.bank.corp (10.0.4.1)
Host is up (0.0012s latency).
PORT    STATE SERVICE  VERSION
22/tcp  open  ssh      OpenSSH 9.6p1 Debian (protocol 2.0)
| ssh2-enum-algos: 
|   kex_algorithms: (classical only)
|     curve25519-sha256
|     ecdh-sha2-nistp256
|     diffie-hellman-group14-sha256 [WARNING: Shor Vulnerable]
|   encryption_algorithms: aes256-gcm@openssh.com
80/tcp  open  http     nginx 1.26.0
|_http-title: Did not follow redirect to https://secure-gateway.bank.corp/
443/tcp open  ssl/http nginx 1.26.0
| ssl-enum-ciphers: 
|   TLSv1.2: 
|     ciphers: 
|       TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 (secp256r1) - A
|       TLS_RSA_WITH_AES_256_GCM_SHA384 (rsa 2048) - B [VULNERABLE: Harvest-Now-Decrypt-Later]
|   TLSv1.3: 
|     ciphers: 
|       TLS_AES_256_GCM_SHA384 (ecdh x25519) - A
|_  least strength: B (Legacy RSA Key Exchange)

Nmap done: 1 IP address (1 host up) scanned in 2.84 seconds`,
    remediationCodeSnippet: `# Nginx Post-Quantum TLS Configuration Patch
# Upgrade ssl_ciphers to enable FIPS 203 ML-KEM-768 hybrid key exchange
ssl_protocols TLSv1.3;
ssl_prefer_server_ciphers on;
ssl_ciphers 'TLS_AES_256_GCM_SHA384:TLS_CHACHA20_POLY1305_SHA256';
ssl_ecdh_curve X25519MLKEM768:X25519:secp384r1;`,
  },
  {
    id: 'wireshark',
    name: 'Wireshark / TShark',
    category: 'Sniffing & Spoofing',
    packageName: 'tshark',
    binaryPath: '/usr/bin/tshark',
    version: '4.2.2-1kali1',
    license: 'GPLv2',
    metapackage: 'kali-linux-default',
    summary:
      'Premier network protocol analyzer providing live packet capture, deep protocol dissection, and microscopic inspection of cryptographic handshakes.',
    defensiveUseCase:
      'Auditing network traffic for cleartext protocols, inspecting TLS 1.3 ClientHello extensions for post-quantum key shares, and diagnosing network latency regressions in high-assurance mil/aero datalinks.',
    pqcRelevance:
      'Validates whether the ClientHello Supported Groups extension contains Post-Quantum KEM Group IDs (e.g. 0x11ec for X25519MLKEM768 or 0x6399 for Kyber768).',
    defaultCommand: 'tshark -i eth0 -Y "tls.handshake.type == 1" -T fields -e tls.handshake.extensions_supported_group -c 5',
    supportedFlags: [
      { flag: '-i <interface>', description: 'Select capture interface', example: 'tshark -i eth0' },
      { flag: '-Y <filter>', description: 'Apply Wireshark display filter', example: 'tshark -Y "tls"' },
      { flag: '-w <file.pcap>', description: 'Write raw packets to pcapng file', example: 'tshark -w capture.pcapng' },
    ],
    sampleOutput: `Running as user "kali" and group "kali". Capturing on 'eth0'
  1 0.000000 10.0.4.15 -> 10.0.4.1  TLS 517 Client Hello
    Handshake Protocol: Client Hello
      Version: TLS 1.2 (0x0303)
      Extension: supported_groups (len=12)
        Supported Groups (6 groups)
          Supported Group: X25519MLKEM768 (0x11ec) [NIST FIPS 203 PQC HYBRID]
          Supported Group: x25519 (0x001d)
          Supported Group: secp256r1 (0x0017)
      Extension: key_share (len=1216)
        Key Share Entry: Group: X25519MLKEM768, Key Exchange Length: 1216
  2 0.001420 10.0.4.1  -> 10.0.4.15 TLS 1184 Server Hello, Change Cipher Spec, Application Data
    Handshake Protocol: Server Hello
      Extension: key_share (len=1120)
        Key Share Entry: Group: X25519MLKEM768 [PQC SESSION RATIFIED]
5 packets captured`,
    remediationCodeSnippet: `# Python Scapy PQC Handshake Validator
from scapy.all import sniff, TLS
def check_pqc_extension(pkt):
    if pkt.haslayer(TLS):
        print(f"[PQC AUDIT] TLS Packet captured: len={len(pkt)} - Verified FIPS 203 KeyShare")
sniff(iface="eth0", filter="tcp port 443", prn=check_pqc_extension, count=10)`,
  },
  {
    id: 'sslscan',
    name: 'sslscan (SSL/TLS Cipher Suite Evaluator)',
    category: 'Vulnerability Analysis',
    packageName: 'sslscan',
    binaryPath: '/usr/bin/sslscan',
    version: '2.1.3-1kali1',
    license: 'GPLv3',
    metapackage: 'kali-linux-default',
    summary:
      'Fast SSL/TLS service auditor testing supported cipher suites, curves, renegotiation bugs, and certificate expiration.',
    defensiveUseCase:
      'Automating TLS hardening audits across internal and external endpoints; verifying removal of TLS 1.0/1.1 and deprecated CBC-mode ciphers.',
    pqcRelevance:
      'Instantly pinpoints endpoints lacking quantum-resistant key encapsulation and flags certificates utilizing Shor-vulnerable RSA-2048/3072 or ECDSA signatures.',
    defaultCommand: 'sslscan --tlsall 10.0.4.1:443',
    supportedFlags: [
      { flag: '--tlsall', description: 'Test all TLS protocol versions (1.0, 1.1, 1.2, 1.3)', example: 'sslscan --tlsall target' },
      { flag: '--show-certificate', description: 'Dump certificate and public key details', example: 'sslscan --show-certificate target' },
      { flag: '--no-failed', description: 'List only accepted cipher suites', example: 'sslscan --no-failed target' },
    ],
    sampleOutput: `Version: 2.1.3
Testing SSL server 10.0.4.1 on port 443 using SNI name 10.0.4.1

Supported Server Protocols:
  TLSv1.0  disabled
  TLSv1.1  disabled
  TLSv1.2  enabled
  TLSv1.3  enabled

Accepted TLSv1.3 Ciphers:
  Preferred:  TLS_AES_256_GCM_SHA384             256 bits  Curves: X25519MLKEM768, x25519
  Accepted:   TLS_CHACHA20_POLY1305_SHA256       256 bits  Curves: X25519MLKEM768, x25519

Accepted TLSv1.2 Ciphers:
  Accepted:   ECDHE-RSA-AES256-GCM-SHA384        256 bits  [CRITICAL: RSA Key Exchange Vulnerable to Harvest-Now-Decrypt-Later]
  Accepted:   ECDHE-RSA-AES128-GCM-SHA256        128 bits  [CRITICAL: 128-bit symmetric key below CNSA 2.0 standards]

Server Key: RSA 2048 bits (Signature: sha256WithRSAEncryption)
Quantum Vulnerability Rating: HIGH (Certificate & KEX must be upgraded to NIST FIPS 203/204)`,
  },
  {
    id: 'nikto',
    name: 'Nikto (Web Server Vulnerability Scanner)',
    category: 'Web Application Analysis',
    packageName: 'nikto',
    binaryPath: '/usr/bin/nikto',
    version: '2.5.0-1kali1',
    license: 'GPLv2',
    metapackage: 'kali-linux-default',
    summary:
      'Open-source web server scanner that tests for over 7,000 potentially dangerous files, outdated program versions, and insecure HTTP response headers.',
    defensiveUseCase:
      'Security baseline validation for HTTP security headers (HSTS, CSP, X-Frame-Options, Content-Type-Options) and detecting dangerous default installation scripts.',
    pqcRelevance:
      'Audits Strict-Transport-Security (HSTS) headers and TLS policy enforcement, ensuring clients are prevented from downgrading to classical-only unencrypted transports.',
    defaultCommand: 'nikto -h https://10.0.4.1 -ssl',
    supportedFlags: [
      { flag: '-h <host>', description: 'Target host or URL', example: 'nikto -h 10.0.4.1' },
      { flag: '-ssl', description: 'Force SSL/TLS mode on port', example: 'nikto -h 10.0.4.1 -ssl' },
      { flag: '-Tuning <x>', description: 'Scan tuning category (e.g. 1=Info, 2=Misconfig)', example: 'nikto -h target -Tuning 2' },
    ],
    sampleOutput: `- Nikto v2.5.0
---------------------------------------------------------------------------
+ Target IP:          10.0.4.1
+ Target Hostname:    secure-gateway.bank.corp
+ Target Port:        443
+ Start Time:         2026-10-11 14:48:52 (GMT0)
---------------------------------------------------------------------------
+ Server: nginx/1.26.0
+ The anti-clickjacking X-Frame-Options header is present and set to SAMEORIGIN.
+ The X-Content-Type-Options header is present and set to 'nosniff'.
+ Strict-Transport-Security (HSTS) header is present: max-age=63072000; includeSubDomains; preload.
+ Root directory returned 200 OK with Content-Security-Policy enabled.
+ 0 dangerous HTTP methods permitted (TRACE, TRACK disabled).
+ End Time:           2026-10-11 14:49:10 (18 seconds)
+ 1 host(s) tested`,
  },
  {
    id: 'lynis',
    name: 'Lynis (System Hardening & CIS Compliance)',
    category: 'Reporting & Compliance',
    packageName: 'lynis',
    binaryPath: '/usr/bin/lynis',
    version: '3.1.0-1kali1',
    license: 'GPLv3',
    metapackage: 'kali-linux-default',
    summary:
      'Battle-tested security auditing tool for systems running Linux, macOS, or Unix. Performs extensive health scans for system hardening and compliance testing (PCI-DSS, HIPAA, ISO27001).',
    defensiveUseCase:
      'Running automated Linux host audits, identifying kernel configuration weaknesses, verifying core dumps are disabled, auditing file permissions, and checking firewall states.',
    pqcRelevance:
      'Audits the OpenSSL / libcrypto system installation and OpenSSH configuration to ensure post-quantum algorithms (ML-KEM, ML-DSA) are present in the system cryptographic policy.',
    defaultCommand: 'lynis audit system --quick',
    supportedFlags: [
      { flag: 'audit system', description: 'Perform full system security audit', example: 'lynis audit system' },
      { flag: '--quick', description: 'Perform fast scan without pausing between sections', example: 'lynis audit system --quick' },
      { flag: '--tests-category <cat>', description: 'Run specific category (e.g. crypto, kernel)', example: 'lynis audit system --tests-category crypto' },
    ],
    sampleOutput: `[+] Initializing Lynis 3.1.0 (Auditing: Linux 6.6.9-kali1-amd64)
---------------------------------------------------
  - Program update status...                                  [ UP-TO-DATE ]
  - Operating system...                                       [ Linux ]
  - Scanning cryptographic configuration...
    - OpenSSL version...                                      [ OpenSSL 3.3.0 ]
    - Cryptographic Policy: FIPS 203/204 Ready                [ HARDENED ]
    - OpenSSH KEX algorithms audited                          [ SUGGESTION ]
    - System entropy generator (Hardware TRNG)                [ OK ]
  - Kernel hardening checks:
    - Kernel ASLR enabled (randomize_va_space=2)...          [ OK ]
    - Core dumps disabled...                                  [ OK ]
    - SYSCTL fs.protected_symlinks=1...                      [ OK ]

[+] Compliance & Hardening Results:
  - Hardening Index: 84 / 100
  - Tests performed: 278
  - Suggestions: 4 (Configure sshd_config with KexAlgorithms mlkem768x25519-sha256)`,
  },
  {
    id: 'msfconsole',
    name: 'Metasploit Framework (msfconsole)',
    category: 'Exploitation & Verification',
    packageName: 'metasploit-framework',
    binaryPath: '/usr/bin/msfconsole',
    version: '6.4.1-1kali1',
    license: 'BSD-3-Clause',
    metapackage: 'kali-linux-default',
    summary:
      'World’s most used penetration testing and security verification platform, containing thousands of modules for vulnerability verification and security assessment.',
    defensiveUseCase:
      'Verifying vulnerability severity before deploying enterprise patches, proving whether a reported CVE is exploitable in the current defense architecture.',
    pqcRelevance:
      'Demonstrates the vulnerability of legacy Diffie-Hellman and RSA pre-master secret captures via proof-of-concept passive decryptions, underscoring the urgent need for FIPS 203 forward secrecy.',
    defaultCommand: 'msfconsole -q -x "banner; version; exit"',
    supportedFlags: [
      { flag: '-q', description: 'Quiet mode; don’t print banner at startup', example: 'msfconsole -q' },
      { flag: '-x <commands>', description: 'Execute console commands on startup', example: 'msfconsole -x "use auxiliary/scanner/ssl/openssl_heartbleed; run"' },
    ],
    sampleOutput: `msf6 > version
Framework: 6.4.1-dev
Console  : 6.4.1-dev

msf6 > use auxiliary/scanner/ssl/ssl_version
msf6 auxiliary(scanner/ssl/ssl_version) > set RHOSTS 10.0.4.1
RHOSTS => 10.0.4.1
msf6 auxiliary(scanner/ssl/ssl_version) > run

[*] 10.0.4.1:443 - TLSv1.3 is SUPPORTED
[*] 10.0.4.1:443 - TLSv1.2 is SUPPORTED
[-] 10.0.4.1:443 - SSLv3 is NOT supported
[-] 10.0.4.1:443 - TLSv1.0 is NOT supported
[*] Scanned 1 of 1 hosts (100% complete)
[*] Auxiliary module execution completed`,
  },
  {
    id: 'burpsuite',
    name: 'Burp Suite Community Edition',
    category: 'Web Application Analysis',
    packageName: 'burpsuite',
    binaryPath: '/usr/bin/burpsuite',
    version: '2024.3.1',
    license: 'Proprietary Freeware',
    metapackage: 'kali-linux-default',
    summary:
      'Leading graphical tool for testing web application security, featuring an intercepting HTTP proxy, spider, repeater, and decoder.',
    defensiveUseCase:
      'Manual security assessment of web APIs and microservices, analyzing JSON Web Token (JWT) signatures, session management, and CSRF protection.',
    pqcRelevance:
      'Auditing JWT tokens signed with legacy RS256 (RSA-2048) or ES256 (ECDSA) and verifying migration to ML-DSA-44 or ML-DSA-65 post-quantum signatures.',
    defaultCommand: 'burpsuite --version',
    supportedFlags: [
      { flag: '--version', description: 'Display Burp Suite version information', example: 'burpsuite --version' },
      { flag: '--project-file=<f>', description: 'Open specific project file', example: 'burpsuite --project-file=audit.burp' },
    ],
    sampleOutput: `Burp Suite Community Edition - Version 2024.3.1
Proxy listener active on 127.0.0.1:8080
Intercepting HTTP/HTTPS traffic.
Ready for manual request inspection and cryptographic token tampering analysis.`,
  },
  {
    id: 'john',
    name: 'John the Ripper',
    category: 'Password Attacks',
    packageName: 'john',
    binaryPath: '/usr/bin/john',
    version: '1.9.0-jumbo-1',
    license: 'GPLv2',
    metapackage: 'kali-linux-default',
    summary:
      'Fast password security auditor and hash identifier supporting hundreds of hash and cipher types (Unix shadow, Kerberos, ZIP, PDF, crypt).',
    defensiveUseCase:
      'Testing strength of system password policies, locating weak or default credentials in shadow files, and benchmarking cryptographic hashing algorithms.',
    pqcRelevance:
      'Grover’s quantum search algorithm halves effective symmetric hash security (SHA-256 provides 128-bit quantum security). John benchmarks verify throughput when transitioning to SHA-3-512 and SHAKE256.',
    defaultCommand: 'john --test --format=sha512crypt',
    supportedFlags: [
      { flag: '--test', description: 'Run performance benchmark', example: 'john --test' },
      { flag: '--format=<fmt>', description: 'Specify hash algorithm', example: 'john --test --format=sha512crypt' },
      { flag: '--show <file>', description: 'Show cracked passwords', example: 'john --show hashes.txt' },
    ],
    sampleOutput: `Will run 8 OpenMP threads
Benchmarking: sha512crypt-opencl, crypt(3) $6$ [SHA512 OpenCL]... DONE
Raw:    48200 c/s real, 48200 c/s virtual
Cryptographic Assessment:
  - Classical security: 512 bits
  - Post-Quantum Security (Grover bounds): 256 bits [CNSA 2.0 Level 5 Approved]
All benchmarks complete with zero integrity errors.`,
  },
  {
    id: 'aircrack-ng',
    name: 'Aircrack-ng Suite',
    category: 'Wireless Attacks',
    packageName: 'aircrack-ng',
    binaryPath: '/usr/bin/aircrack-ng',
    version: '1.7-1kali1',
    license: 'GPLv2',
    metapackage: 'kali-linux-default',
    summary:
      'Complete suite of tools to assess WiFi network security, focusing on monitoring, attacking, testing, and cracking 802.11 WEP and WPA/WPA2/WPA3 keys.',
    defensiveUseCase:
      'Auditing corporate wireless boundaries for rogue access points, testing WPA2 Enterprise 802.1X EAP-TLS configurations, and verifying WPA3 SAE Dragonfly handshake integrity.',
    pqcRelevance:
      'Evaluates EAP-TLS wireless authentication certificates to verify RADIUS servers have phased out RSA-2048 client certs in favor of post-quantum lattice certs.',
    defaultCommand: 'aircrack-ng -u',
    supportedFlags: [
      { flag: '-u', description: 'Show processor / AVX CPU benchmark', example: 'aircrack-ng -u' },
      { flag: '-w <wordlist>', description: 'Path to wordlist file', example: 'aircrack-ng -w words.txt cap.cap' },
    ],
    sampleOutput: `Aircrack-ng 1.7 - (C) 2006-2022 Thomas d'Otreppe
System Architecture: x86_64 with AVX2 Hardware Acceleration
Benchmark WPA-PBKDF2-HMAC-SHA1: 18,400 k/s
Wireless Security Status:
  - WPA3 SAE (Dragonfly Handshake): Quantum-resistant password-authenticated key exchange
  - WPA2 Enterprise (EAP-TLS): Requires FIPS 204 ML-DSA RADIUS certificate update`,
  },
  {
    id: 'ghidra',
    name: 'Ghidra (NSA Reverse Engineering Suite)',
    category: 'Reverse Engineering',
    packageName: 'ghidra',
    binaryPath: '/usr/bin/ghidra',
    version: '11.0.1-1kali1',
    license: 'Apache-2.0',
    metapackage: 'kali-linux-large',
    summary:
      'Software reverse engineering (SRE) framework developed by the NSA Research Directorate, featuring a powerful decompiler, disassembler, and P-Code intermediate representation.',
    defensiveUseCase:
      'Analyzing closed-source third-party binaries, firmware images, and drivers to detect hardcoded keys, vulnerabilities, and backdoor routines.',
    pqcRelevance:
      'Locates embedded classical cryptographic primitives (OpenSSL BIGNUM routines, Montgomery multiplication, Weierstrass curve point addition) in legacy binaries to generate CBOM migration roadmaps.',
    defaultCommand: 'ghidra --headless /tmp/project import /bin/ls -analyze',
    supportedFlags: [
      { flag: '--headless', description: 'Run Ghidra in non-GUI batch mode', example: 'ghidra --headless /tmp/proj import target -analyze' },
      { flag: '-postScript', description: 'Run post-analysis Java or Python script', example: 'ghidra --headless proj imp bin -postScript FindCrypto.py' },
    ],
    sampleOutput: `INFO  Headless analyzer launched (Ghidra 11.0.1)
INFO  Opening project: /tmp/pqc_audit_proj
INFO  Importing file: /usr/lib/libcrypto.so.3
INFO  Auto-analyzing imported file...
  [+] Decompiling 1,842 functions...
  [+] Cryptographic Symbol Detector:
      - Found: RSA_generate_key_ex (Address: 0x000412a0) [CLASSICAL VULNERABLE]
      - Found: EC_KEY_new_by_curve_name (Address: 0x00062b10) [CLASSICAL VULNERABLE]
      - Found: EVP_KEM_fetch ("ML-KEM-768") (Address: 0x00084c20) [PQC COMPLIANT]
INFO  Analysis completed with 0 errors.`,
  },
  {
    id: 'binwalk',
    name: 'Binwalk (Firmware Analysis Tool)',
    category: 'Forensics & Incident Response',
    packageName: 'binwalk',
    binaryPath: '/usr/bin/binwalk',
    version: '2.3.4-1kali1',
    license: 'MIT',
    metapackage: 'kali-linux-default',
    summary:
      'Tool for searching a given binary image for embedded files and executable code, widely used for reverse engineering IoT and avionics firmware.',
    defensiveUseCase:
      'Extracting filesystems (SquashFS, CramFS, JFFS2) from hardware firmware dumps to audit embedded private keys, configuration secrets, and outdated libraries.',
    pqcRelevance:
      'Detects hardcoded X.509 certificates and RSA private keys in embedded devices that cannot easily be updated over-the-air, highlighting supply chain quantum risks.',
    defaultCommand: 'binwalk -B firmware.bin',
    supportedFlags: [
      { flag: '-B', description: 'Scan target file for common file signatures', example: 'binwalk -B firmware.bin' },
      { flag: '-e', description: 'Automatically extract known file types', example: 'binwalk -e firmware.bin' },
      { flag: '-E', description: 'Calculate file entropy for encrypted/compressed blocks', example: 'binwalk -E firmware.bin' },
    ],
    sampleOutput: `DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             uImage header, header size: 64 bytes, data size: 1842000 bytes
64            0x40            gzip compressed data, maximum compression, from Unix
1842064       0x1C1B90        Squashfs filesystem, little endian, version 4.0, size: 8421000 bytes
10263064      0x9C9C18        Certificate in DER format (x509 v3), subject: /C=US/O=Avionics Corp
10264088      0x9CA018        RSA private key, 2048 bits (PKCS#1) [DEPRECATION WARNING: Replace with ML-DSA-87]`,
  },
  {
    id: 'volatility',
    name: 'Volatility 3 (Memory Forensics Framework)',
    category: 'Forensics & Incident Response',
    packageName: 'volatility3',
    binaryPath: '/usr/bin/vol',
    version: '2.5.2-1kali1',
    license: 'GPLv2',
    metapackage: 'kali-linux-large',
    summary:
      'Forensic memory analysis framework that extracts digital artifacts from volatile system memory (RAM) dumps.',
    defensiveUseCase:
      'Investigating advanced persistent threats (APTs), detecting rootkits, extracting in-memory process lists, and uncovering live injected shellcode.',
    pqcRelevance:
      'Extracts ephemeral session keys and investigates memory leakage of cryptographic key material from process heaps.',
    defaultCommand: 'vol -f memory.raw windows.pslist',
    supportedFlags: [
      { flag: '-f <file>', description: 'Specify memory image file', example: 'vol -f memory.raw' },
      { flag: 'linux.pslist', description: 'List processes for Linux memory dump', example: 'vol -f mem.raw linux.pslist' },
      { flag: 'windows.malfind', description: 'Find injected code / suspicious memory pages', example: 'vol -f mem.raw windows.malfind' },
    ],
    sampleOutput: `Volatility 3 Framework 2.5.2
Progress:  100.00%  Validating symbols and scanning memory dump...
PID     PPID    ImageFileName   Offset(V)       Threads Handles Session TimeCreated
4       0       System          0xfa8001201040  98      -       -       2026-10-11 10:14:02
842     4       lsass.exe       0xfa8002404080  8       380     0       2026-10-11 10:14:05
1024    842     cryptosvc.dll   0xfa8003112020  14      120     0       2026-10-11 10:14:08
[*] Memory scan complete: Zero injected unauthorized memory segments detected.`,
  },
  {
    id: 'sqlmap',
    name: 'SQLmap',
    category: 'Database Assessment',
    packageName: 'sqlmap',
    binaryPath: '/usr/bin/sqlmap',
    version: '1.8.2-1kali1',
    license: 'GPLv2',
    metapackage: 'kali-linux-default',
    summary:
      'Automatic SQL injection and database takeover tool with a powerful detection engine and broad database backend support.',
    defensiveUseCase:
      'Defensive auditing of database queries and parameterized query verification across enterprise web portals.',
    pqcRelevance:
      'Validates whether database storage layers use transparent quantum-resistant column encryption (TDE) with AES-256-GCM rather than legacy DES/3DES.',
    defaultCommand: 'sqlmap --version',
    supportedFlags: [
      { flag: '-u <url>', description: 'Target URL', example: 'sqlmap -u "https://target/api?id=1"' },
      { flag: '--batch', description: 'Never ask for user input, use default behavior', example: 'sqlmap -u target --batch' },
      { flag: '--risk=1', description: 'Risk of tests to perform (1-3)', example: 'sqlmap -u target --risk=1' },
    ],
    sampleOutput: `sqlmap/1.8.2#stable - automatic SQL injection tool
Testing parameterized statement enforcement...
Target API parameters evaluated:
[INFO] Testing connection to the target URL
[INFO] Parameter 'id' is NOT injectable (Proper ORM prepared statements enforced)
[INFO] Cryptographic database connection validated: TLS 1.3 Active`,
  },
  {
    id: 'checksec',
    name: 'checksec (Binary Mitigation Inspector)',
    category: 'Reverse Engineering',
    packageName: 'checksec',
    binaryPath: '/usr/bin/checksec',
    version: '2.6.0-1kali1',
    license: 'BSD-3-Clause',
    metapackage: 'kali-linux-default',
    summary:
      'Utility for checking the binary security properties of executables (such as stack canaries, non-executable stack, and ASLR support).',
    defensiveUseCase:
      'Ensuring software build pipelines compile binaries with full exploit mitigations (RELRO, Stack Canary, NX, PIE, Fortify Source).',
    pqcRelevance:
      'Verifies whether newly compiled Post-Quantum cryptographic libraries (e.g. liboqs, quantum-safe OpenSSL engines) have all security mitigations enabled.',
    defaultCommand: 'checksec --file=/usr/lib/liboqs.so',
    supportedFlags: [
      { flag: '--file=<file>', description: 'Check security mitigations on target executable/library', example: 'checksec --file=/bin/ls' },
      { flag: '--dir=<dir>', description: 'Check all binaries in directory', example: 'checksec --dir=/usr/bin' },
    ],
    sampleOutput: `RELRO           STACK CANARY      NX            PIE             RPATH      RUNPATH      Symbols         FILE
Full RELRO      Canary found      NX enabled    PIE enabled     No RPATH   No RUNPATH   No Symbols      liboqs.so
[+] Maximum hardening detected: Binary compiled with full compiler exploit defenses.`,
  },
];

export const KALI_AUDIT_SCENARIOS: KaliAuditScenario[] = [
  {
    id: 'tls-pqc-audit',
    title: 'Enterprise Perimeter TLS & Post-Quantum Readiness Audit',
    category: 'Network & Cryptography',
    description:
      'Executes Nmap with ssl-enum-ciphers and sslscan against the network gateway to discover Harvest-Now-Decrypt-Later RSA/ECC vulnerabilities and verify FIPS 203 ML-KEM hybrid availability.',
    targetEnvironment: '10.0.4.1:443 (Gateway)',
    toolsUsed: ['nmap', 'sslscan', 'tshark'],
    simulatedCommand: 'nmap -p 443 --script ssl-enum-ciphers 10.0.4.1 && sslscan --tlsall 10.0.4.1',
    pqcRemediationAvailable: true,
    expectedFindings: [
      'Identified legacy TLS_RSA_WITH_AES_256_GCM_SHA384 cipher requiring immediate retirement',
      'Detected classical-only X25519 curve; recommended upgrade to X25519MLKEM768 draft group',
      'Automated Nginx/HAProxy remediation patch ready for export to PQC Pipeline',
    ],
  },
  {
    id: 'system-hardening-cis',
    title: 'Linux Host Security & CIS Benchmark Compliance Audit',
    category: 'Host & Compliance',
    description:
      'Runs Lynis automated audit alongside checksec binary inspection to evaluate kernel ASLR, core dump restrictions, and system cryptographic entropy.',
    targetEnvironment: 'localhost (Kali Host)',
    toolsUsed: ['lynis', 'checksec'],
    simulatedCommand: 'lynis audit system --quick && checksec --file=/usr/lib/libcrypto.so.3',
    pqcRemediationAvailable: false,
    expectedFindings: [
      'Hardening Index: 84/100 (CIS Linux Benchmark compliant)',
      'Hardware TRNG verified delivering high-entropy seeds for crypto PRNG',
      'Full RELRO, Stack Canary, and NX verified on system libcrypto library',
    ],
  },
  {
    id: 'firmware-crypto-inspection',
    title: 'Embedded Avionics Firmware Cryptographic Extraction',
    category: 'Reverse Engineering & Forensics',
    description:
      'Utilizes Binwalk to dissect firmware headers and identify embedded RSA private keys and certificates inside flash partitions.',
    targetEnvironment: 'firmware_f35_sensor.bin (12 MB)',
    toolsUsed: ['binwalk', 'ghidra'],
    simulatedCommand: 'binwalk -B -E firmware_f35_sensor.bin',
    pqcRemediationAvailable: true,
    expectedFindings: [
      'Discovered unencrypted X.509 RSA-2048 certificate at offset 0x9C9C18',
      'Calculated entropy anomaly indicating compressed SquashFS payload',
      'Exportable CBOM entry generated for PQC Migration Pipeline remediation',
    ],
  },
  {
    id: 'live-handshake-capture',
    title: 'Live Post-Quantum Packet Capture & KeyShare Validation',
    category: 'Protocol Dissection',
    description:
      'Captures live TLS 1.3 handshakes on eth0 with TShark to decode Supported Groups and verify the presence of ML-KEM-768 key encapsulation tokens.',
    targetEnvironment: 'eth0 (Promiscuous Mode)',
    toolsUsed: ['tshark', 'wireshark'],
    simulatedCommand: 'tshark -i eth0 -Y "tls.handshake.type == 1" -c 5',
    pqcRemediationAvailable: true,
    expectedFindings: [
      'Detected ClientHello containing Group ID 0x11ec (X25519MLKEM768)',
      'Verified KeyShare payload length: 1,216 bytes (NIST FIPS 203 conforming)',
      'Zero classical downgrade attacks detected on active interface',
    ],
  },
];
