# RATs, Red Teaming, and a Project That Will Actually Score Well

A briefing for a cybersecurity course red-team assignment on Windows.
Written to be used as a working document — steal the structure, the diagrams and
the report outline directly.

---

## 1. What a RAT actually is

**RAT = Remote Access Trojan.** It is a program that gives an operator remote
control of a machine, and that reaches that machine by tricking a user or an
administrator into running it — rather than by arriving through a legitimate,
consented remote-management channel.

That second half of the definition is the whole ball game. **A RAT is not
distinguished by its code. It is distinguished by consent and intent.**
TeamViewer, AnyDesk, Microsoft Intune, ScreenConnect and Splunk's forwarder
deployment agent all do roughly what a RAT does: they run a process, talk to a
server over the internet, and let someone on the other end see and act on the
machine. The difference is that a legitimate remote-monitoring-and-management
(RMM) tool is installed by or with the knowledge of the machine owner, has a
visible tray icon or service registration, and has an audit trail. A RAT is the
same capability delivered under false pretences, or installed without consent,
or hidden.

This is not a pedantic distinction — it is the core insight of the assignment,
and the most common thing students on this brief miss.

### 1.1 Anatomy of a RAT

Almost every RAT, from 2005-grade subseven clones to modern commodity families,
decomposes into five parts:

| Component | What it does | Typical Windows implementation |
|---|---|---|
| **Delivery / stager** | Gets code executing on the box | Phishing attachment, trojanised installer, malicious macro, "crack", USB, fake update, SEO-poisoned download |
| **Implant / payload** | The running code on the target | `.exe`, DLL side-load, PowerShell one-liner, signed binary proxy execution, scheduled task running a script |
| **C2 channel** | How the operator talks to the implant | Raw TCP/UDP socket, HTTPS beaconing to a domain, DNS tunnelling, Telegram/Discord/Slack API abuse, cloud storage buckets, named pipes over SMB |
| **Persistence** | Surviving reboot | Run key, Startup folder, scheduled task, Windows service, WMI event subscription, COM hijack |
| **Operator console** | The human-facing UI | GUI panel, CLI, chat-ops style interface, or a full C2 framework |

Everything else — keylogging, screen capture, file transfer, shell, webcam,
microphone, credential dumping, lateral movement — is a **module** bolted onto
the implant. That modularity is why "can a RAT keylog?" is not really a question
about the protocol, it is a question about which modules the operator loaded.

### 1.2 Capability list you should be able to talk about

Group these by ATT&CK tactic when you present — instructors notice structure far
more than they notice a long feature list.

**Execution & discovery**
- Remote shell (`cmd.exe` / PowerShell) — T1059
- System, user, domain, network and software discovery — T1082, T1033, T1016, T1518
- File and directory listing — T1083

**Collection**
- Keystrokes (userland hook, raw input device, or driver) — T1056.001
- Clipboard contents — T1115
- Screenshots — T1113
- Webcam and microphone — T1125
- Browser credential stores and session cookies — T1555.003

**Command & control**
- Beaconing over HTTPS to blend with normal web traffic — T1071.001
- Encrypted channel — T1573
- Non-standard ports — T1571
- Fast-flux, domain fronting, or legitimate-service abuse to survive blocking — T1090, T1102
- Jitter and sleep intervals to defeat periodicity detection

**Persistence & defence evasion** *(describe, do not build — see §3)*
- Run keys, Startup folder, scheduled tasks, services — T1547.001, T1053.005, T1543.003
- Masquerading as a system binary — T1036.005
- Obfuscation / packing — T1027
- Disabling or tampering with security tooling — T1562.001

**Impact / follow-on**
- Data staging and exfiltration over the C2 channel — T1074, T1041
- Ransomware deployment, at which point "RAT" has become "initial access broker + ransomware affiliate"

### 1.3 How RATs actually show up in the wild (good presentation material)

The interesting modern story is that bespoke RATs are *less* common than **abuse
of legitimate RMM software**. Threat groups regularly phone a helpdesk, pretend
to be an employee, and talk the agent into installing AnyDesk or launching
Windows Quick Assist — a technique documented as **T1219, Remote Access
Software**. Nothing malicious is ever written to disk; the "malware" is a
signed, legitimate installer. This is why detection has shifted from "find the
bad .exe" to "baseline what remote-access tooling is *supposed* to exist in this
environment, and alert on everything else."

Commodity RAT families that are worth knowing by name for context — njRAT,
QuasarRAT, Remcos, AsyncRAT, DarkComet, PoisonIvy, Gh0st, and the
Cobalt Strike / Sliver / Mythic frameworks used in red teams and by intruders
alike. Most are open source or cracked, which is exactly why a "novel RAT" is
not a meaningful contribution from a student.

---

## 2. What your instructor probably actually wants

"Create a RAT" is usually shorthand for **"demonstrate you understand the
attacker kill chain end to end, on Windows, safely."** A from-scratch RAT
implementation tests roughly three things: sockets, a Windows API call or two,
and your ability to copy a persistence technique. It tests almost nothing about
whether you understand detection, ethics, or the operator tradecraft that
actually distinguishes a red teamer from a script kiddie — and it produces
malware you cannot legally share, demo at scale, or put on a CV.

The projects in §4 are designed to give you **more** credit, not less, while
being things you can show an employer.

---

## 3. Non-negotiables before you write a single line of code

These are not legal boilerplate. In a class graded on ethics, the boundary
conditions are often worth explicit marks, and one careless choice can fail the
module or worse.

1. **Get written authorisation.** Even for your own lab, ask your instructor for
   a signed scope note: what systems are in scope, what window of time, what
   activity is permitted, who the point of contact is. There is a template in
   `docs/rules-of-engagement-template.md`.
2. **Only ever test machines you own or have explicit written permission to
   test.** "The university network" is not yours. "My own Windows 11 VM in
   VirtualBox" is.
3. **Isolate the lab.** Host-only / internal-only virtual network, no bridged
   adapter, no shared folders with the host, snapshots before every run. If your
   payload beacons out, it beacons to a C2 you are also running in the same
   isolated subnet.
4. **Never build or ship evasion.** No AV/EDR bypass, no AMSI patching, no
   unhooking, no crypter, no signing with stolen certs, no packing to beat
   Defender. This is the line between a coursework demo and malware
   development, and it is not negotiable regardless of the grade. If the brief
   literally asks for evasion, take it back to your instructor and propose the
   detection-side equivalent — it is a stronger piece of work anyway.
5. **Nothing that spreads.** No self-propagation, no worm behaviour, no mass
   emailing, no infecting shared drives or USB sticks that leave the room.
6. **Nothing that leaves your control.** No hardcoded public IPs, no
   third-party C2 hosted on infrastructure you do not own, no "test it on a
   friend's laptop to see if it works."
7. **Defang everything you publish.** Write `hxxps://evil[.]example[.]com` in
   slides and reports, not a clickable link. Don't attach live binaries to
   emails or public repos.
8. **Dispose of artefacts deliberately.** Destroy VM snapshots containing the
   implant, delete C2 databases, and say in your report that you did so.

### On the law, briefly

Unauthorised access to a computer system is a criminal offence in essentially
every jurisdiction. In Nigeria: the **Cybercrimes (Prohibition, Prevention,
etc.) Act 2015, as amended** — sections covering unauthorised access, and
separate provisions for the interception of communications and for systems
affecting critical national information infrastructure. Comparable statutes:
the UK **Computer Misuse Act 1990**, the US **Computer Fraud and Abuse Act**,
the EU **Directive 2013/40/EU**. Intent, "I was just learning", and "it was a
prank" are not defences. Authorisation is.

*(General education, not legal advice — if your project touches anything beyond
your own lab, talk to your instructor and, if needed, the university's legal
office.)*

### Where I can help, and where I won't

I'll happily help you with: the lab design, the rules of engagement, detection
engineering, Sysmon/Event Log analysis, threat modelling, the report, the
slides, and building a **consent-based** remote support tool (§4, Option D).
I won't write you a covert implant, a persistence mechanism, an evasion
technique, or a C2 server design. That is a line I hold regardless of how the
assignment is phrased — and as §4 argues, it is also the line between a project
that impresses people and one that quietly ends a career before it starts.

---

## 4. Project options, ranked

### Option A — "Full kill chain in an isolated lab" ⭐ recommended
**Best grade-per-hour, and unambiguously legal.**

Build a two-VM lab (Windows 11 target, Kali or Ubuntu attacker) on a host-only
network, and use **MITRE Caldera** — a purpose-built, legal adversary-emulation
platform — as your C2. Caldera ships with an agent ("Sandcat") designed for
exactly this: it is a real implant architecture, written by MITRE, safe to run,
and every capability is mapped to ATT&CK. You get the full RAT experience —
beaconing, tasking, multi-host operations, modular abilities — without writing
malware.

Run a small operation: initial execution, discovery, credential-access attempt
(against a throwaway local account), lateral movement to a second VM, and data
collection. Then, and this is the marked part, **capture the telemetry it
generates** with Sysmon and turn it into detection rules.

- **Deliverables:** lab topology diagram; operation log with timestamps; ATT&CK
  Navigator layer of what you executed; 5–8 Sigma rules that catch your own
  operation; a "what a defender saw" timeline; report + 10-minute demo.
- **Tooling:** VirtualBox/VMware, Windows 11 Enterprise eval ISO (90-day,
  Microsoft Evaluation Center), Caldera, Sysmon + a published config,
  Atomic Red Team for supplementary tests, Chainsaw or Hayabusa to hunt over
  the logs, Sigma for rules.
- **Time:** ~4 weeks part-time.
- **Why it wins:** it demonstrates offensive *and* defensive competence, it is
  reproducible by your marker, and the artefacts are safe to publish on GitHub.

### Option B — "Purple team: build the detector, not the malware" ⭐ strong
**The option most likely to stand out in a class full of njRAT clones.**

Take real, documented RAT behaviours and write the detection layer for them.
Use **Atomic Red Team** to generate ground-truth telemetry for 15–20 ATT&CK
techniques, collect it with Sysmon and PowerShell script-block logging, then
write Sigma rules and a hunt playbook. Validate: does your rule fire on the
attack, and does it stay quiet on a baseline of normal admin activity?

- **Deliverables:** detection repo (rules + tests), false-positive analysis
  against a clean baseline, a triage runbook for an analyst who receives the
  alert, and a coverage matrix showing which techniques you can and cannot see.
- **Stretch goal:** a small **honeypot C2 listener** — a fake endpoint that logs
  who connects to it and with what user-agent. Nobody is attacked; you are
  studying the attacker side of the wire from the outside. Very demo-friendly.
- **Time:** ~3 weeks.
- **Why it wins:** detection engineering is a real, in-demand job. Almost no
  student portfolio has a detection repo in it. Yours would.

### Option C — "Teardown: dissect a public RAT safely"
**Analysis project. Great if you prefer writing to coding.**

Take a well-documented, widely-available **open-source** RAT (QuasarRAT and
AsyncRAT are the usual teaching samples) and do a static and dynamic analysis of
it **inside a detonated, network-isolated VM** — no internet, no shared folders.
Produce a technical write-up: architecture, protocol, persistence mechanism,
config extraction, IOCs, ATT&CK mapping, and YARA rules that identify the family.

- **Deliverables:** analyst report in a professional format (like a vendor
  threat-intel note), IOC list defanged, YARA rules tested against the sample
  and against benign files, and an ATT&CK map.
- **Tooling:** FLARE-VM or REMnux, PE-bear / Detect It Easy, Ghidra or
  dnSpy/ILSpy for .NET samples, Procmon, Wireshark, `strings`, YARA.
- **Time:** ~3 weeks.
- **Caution:** confirm with your instructor that handling a real sample is
  permitted, keep it off the internet and out of the repo, and note in the
  report how you contained and destroyed it.

### Option D — "Build the legitimate version: a consent-first remote support agent"
**The build-it-yourself option that is actually defensible.**

Write a small remote-administration agent — Windows client plus a local server —
that implements the *boring, honest* half of what an RMM tool does: a visible
tray presence, an **explicit on-screen consent prompt before any session
starts**, a persistent and human-readable audit log of every action, a kill
switch, and a hard-coded allowlist of safe operations. Then red-team your own
tool: document which parts, if removed, would turn it into a RAT, and write the
detections for each.

- **Deliverables:** working tool, threat model ("what an attacker would have to
  change to weaponise this"), threat-model-to-detection mapping, and a short
  ethics/dual-use essay that will score extremely well on a red-team module.
- **Time:** ~4 weeks.
- **Why it wins:** you get to write real sockets and real Windows code — the
  thing the original brief wanted — with a defensible purpose and a genuinely
  interesting conclusion: *the difference between this tool and a RAT is about
  forty lines of code and a consent prompt.* That is a thesis, and graders love
  a thesis.

**Suggested combination:** Option A or D as your main build, plus a slice of
Option B (5–8 Sigma rules) as the defensive module. That combination covers
offence, defence and ethics — the three things a red-team module is usually
graded on.

---

## 5. Lab topology

```
        ┌──────────────────────────────┐
        │        HOST (your laptop)    │
        │  VirtualBox / VMware         │
        └──────────────┬───────────────┘
                       │  host-only network  10.10.10.0/24
                       │  NO bridged adapter, NO NAT on the target
        ┌──────────────┴───────────────────────────────┐
        │                                              │
┌───────▼─────────────┐                     ┌──────────▼────────────┐
│ ATTACKER            │                     │ TARGET                │
│ Kali / Ubuntu       │  ── C2 traffic ──▶  │ Windows 11 eval       │
│ 10.10.10.10         │                     │ 10.10.10.20           │
│                     │                     │                       │
│ • Caldera server    │                     │ • Sysmon              │
│ • Sliver (optional) │                     │ • PowerShell logging  │
│ • Wireshark         │                     │ • Defender ON, kept on│
│ • nmap              │                     │ • snapshot before run │
└─────────────────────┘                     └───────────────────────┘
                       │
              ┌────────▼─────────┐
              │ DETECTION VM     │  optional: Wazuh / ELK collecting
              │ 10.10.10.30      │  Sysmon from the target
              └──────────────────┘
```

Rules for the diagram: the target gets a **host-only** adapter only. If you
need to patch it, temporarily attach NAT, update, then remove the adapter before
you run anything.

### Telemetry you want switched on before you start

- **Sysmon** with a published config (e.g. the SwiftOnSecurity or
  sysmon-modular baseline). Key event IDs: 1 process create, 3 network connect,
  8 CreateRemoteThread, 10 ProcessAccess, 11 file create, 12/13/14 registry,
  22 DNS query.
- **Windows Security auditing:** 4688 (process creation with command line),
  4624/4625 (logon), 4698 (scheduled task created), 7045 (service installed).
- **PowerShell:** script block logging (4104) and module logging.
- **Defender kept enabled** on the target. If your emulation gets caught, that is
  a *finding*, and it belongs in your report — not something to switch off.

---

## 6. Report structure that maps to a rubric

Write it in this order; it tracks the way most red-team modules are marked.

1. **Executive summary** — one page, no jargon, for a manager. What you did,
   what the risk was, what you'd fix first.
2. **Scope and authorisation** — quote your RoE. In-scope, out-of-scope,
   window, contact. This section earns ethics marks on its own.
3. **Lab design** — the diagram, the isolation controls, the snapshots.
4. **Methodology** — the kill chain, phase by phase, with ATT&CK IDs.
5. **Findings** — per finding: what you did, what it means in business terms,
   evidence (screenshot / log excerpt / command), likelihood × impact rating.
6. **Detection** — what the defender saw, which rules fired, what was missed
   and *why* (this is the section that separates you from the pack).
7. **Remediation** — mapped to findings, prioritised. Add the unglamorous ones:
   LAPS for local admin passwords, restricting RMM tooling by allowlist,
   blocking macro execution from internet-sourced files, EDR tuning.
8. **Ethics and legal considerations** — dual-use nature of the tooling, why
   the boundary between RMM and RAT is consent, what you would refuse to do on
   an engagement and why.
9. **Appendices** — IoCs (defanged), rule source, raw logs, artefact disposal
   statement.

---

## 7. Ten-minute demo that won't get you in trouble

1. (1 min) The definition. Show a legitimate signed RMM tool and your lab
   implant side by side and ask the room what the actual difference is.
2. (3 min) The lab, from a snapshot, isolated. Run the operation. Narrate it in
   ATT&CK terms.
3. (3 min) Cut to the defender's screen. Show the alerts and telemetry your
   operation generated. This is the moment that lands — *you show them the
   crime and the camera footage in the same breath.*
4. (2 min) What a real defender should have done. Gaps in your own detection.
5. (1 min) Ethics close: "the capability in this room is a dozen lines of
   socket code; the thing that makes it legal is a signed piece of paper and a
   consent prompt."

Rehearse the teardown. Have screenshots of every step in the deck as a fallback,
because live demos fail, and have the VMs snapshotted so a failure is a 30-second
recovery.

---

## 8. If someone asks "isn't this illegal?"

Answer, in this order:

1. Everything ran on machines I own, on an isolated network, with written
   authorisation from my instructor.
2. The tooling I used is purpose-built for authorised adversary emulation and is
   installed by thousands of security teams.
3. Malicious capability and authorised capability are the same codebase. The
   distinguishing features are authorisation, scope, consent, and containment —
   which is why the rules of engagement are part of the assignment, not an
   afterthought.
4. I deliberately did not implement evasion or propagation, because those are
   the techniques that make a tool unsafe to handle and unsafe to publish, and
   they add nothing to the learning objective.

---

## 9. Reading list

- **ATT&CK** — <https://attack.mitre.org> — browse the *Command and Control* and
  *Persistence* tactics before you design anything.
- **MITRE Caldera** — <https://caldera.mitre.org>
- **Atomic Red Team** — <https://github.com/redcanaryco/atomic-red-team>
- **Sigma** (detection rule format) — <https://github.com/SigmaHQ/sigma>
- **Sysmon + sysmon-modular** — <https://github.com/olafhartong/sysmon-modular>
- **Chainsaw** — <https://github.com/WithSecureLabs/chainsaw>
- **Hayabusa** — <https://github.com/Yamato-Security/hayabusa>
- **Wazuh** (open-source SIEM, good for the detection VM) — <https://wazuh.com>
- **The DFIR Report** — <https://thedfirreport.com> — real intrusion write-ups;
  the single best source of "what this actually looks like in logs".
- **Microsoft Evaluation Center** — free 90-day Windows 11 Enterprise eval ISO.
- **"Red Team Development and Operations"** by Joe Vest & James Tubberville —
  the standard text on scope, RoE and reporting.

---

## 10. Next actions

- [ ] Get the scope/RoE signed by your instructor (template in this folder).
- [ ] Pick a main track: A (kill chain) or D (consent-first agent).
- [ ] Build the isolated lab and snapshot a clean target *before* anything else.
- [ ] Turn on Sysmon + script block logging, and verify you can see a plain
      `whoami` in your telemetry. If you can't see that, you can't see anything.
- [ ] Commit the topology diagram, the RoE, and the operation log to the repo as
      you go — a visible process trail is worth marks.
- [ ] Pick five Sigma rules as your detection deliverable and write a test for
      each.
