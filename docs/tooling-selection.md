# Choosing your tooling — the shortlist

Direct answer to "which RAT should I use for this project": **none of them.**
Not as a moral dodge — as a practical one. Downloading and deploying a real RAT
family is the single most common way this assignment goes wrong, for three
concrete reasons:

1. **You cannot submit it.** Your report, your repo, your demo video — none of
   it can contain a live implant. So the marked artefact ends up being a
   screenshot of a stranger's malware running, which is worth almost nothing.
2. **You cannot demo it.** The demo is where the marks are. "I ran njRAT on a VM"
   is a 40-second slide. Option A's live operation-plus-detections is ten
   minutes of content.
3. **The copies you'd find are hostile.** Cracked Cobalt Strike, "free" AsyncRAT
   builds and njRAT packages circulating on forums, Telegram channels and
   YouTube-description links are routinely **backdoored themselves**. There is a
   whole cottage industry of re-packing commodity RATs with a second implant
   that beacons to the repacker. Students downloading these own their own
   machine, and occasionally their university's network. This is not
   hypothetical — it is one of the most common incident types in campus
   security.

So: you need something that *behaves* like a RAT and is *safe to run and
publish*. That exists, and it is purpose-built.

---

## The legitimate shortlist

All of these are open source, actively maintained, used by real red teams, and
safe to document. They are the same category of tooling — the difference from a
RAT is consent, scope and containment, which is the thesis of your project.

| Tool | What it is | Best for your assignment | Notes |
|---|---|---|---|
| **MITRE Caldera** ⭐ | Adversary-emulation platform + "Sandcat" agent | **Option A.** Everything: beaconing, tasking, multi-host, modular abilities, ATT&CK-mapped out of the box | Ships a built-in web UI and a plugin library. The safest possible choice and the easiest to justify to a marker. Start here. |
| **Atomic Red Team** | Library of small, single-technique tests | **Option B.** Ground-truth telemetry per ATT&CK technique | Not a C2. It is the *input* to your detection work. Pair with Caldera. |
| **Sliver** | Modern open-source C2, mTLS/HTTP/DNS/WireGuard, implants for Windows/Linux/macOS | Option A at a more advanced level; demonstrates C2 tradecraft properly | Genuinely used by both red teams *and* criminal groups, so your report must foreground authorisation. Heavier learning curve than Caldera. Documented and defensible — but only deploy it against your own isolated VMs. |
| **Mythic** | C2 framework with a pluggable agent ("Apollo", "Poseidon") and a nice UI | Alternative to Sliver; good if you want to talk about agent architecture | Multi-agent design makes for a strong architecture section. |
| **PowerShell Empire / Starkiller** | Post-exploitation framework, largely legacy | Only if you specifically want to discuss modern PowerShell detection history | Aged; Defender catches most of it trivially. Historically interesting, practically dusty. |
| **Wazuh / ELK** | Open-source SIEM | The detection VM in §5 of the briefing | Not offensive. This is what turns your operation into evidence. |

### On the commercial ones

**Cobalt Strike** and **Brute Ratel** are the commercial tools real intrusions
are built on, and knowing they exist matters for context. Do not use them: CS is
licensed at thousands of dollars per seat, so every "free" copy is cracked and
therefore backdoored, and Brute Ratel requires a licence plus a vetting process.
Mentioning them in your report shows awareness; acquiring them is how people get
their laptop owned.

---

## If your brief explicitly says "analyse a RAT" (Option C)

Then you are not *using* a RAT, you are *dissecting* one, which is a legitimate
and well-established academic exercise — but the containment requirements are
much stricter. Confirm with your instructor first, then:

- **Samples to ask about:** QuasarRAT and AsyncRAT (both open source, .NET, well
  documented in public analyses, and the standard teaching samples). These are
  the ones with enough published literature that you can compare your findings
  against someone else's.
- **Where not to get them:** random forum and Telegram links, "free malware
  packs", YouTube description links. Use only a vetted academic or vendor
  sample source your instructor points you to, or the project's own official
  release page if the instructor agrees — and never a re-pack.
- **Containment, non-negotiable:** FLARE-VM or REMnux, **network adapter
  disconnected entirely** (not just host-only — no adapter), no shared folders,
  no clipboard sharing, no drag-and-drop, snapshot before, revert after, and
  document the disposal in your report.
- **Never** let a sample reach your repo, your cloud storage, your email, or a
  USB stick. Note in the report that you did not.

If you cannot get clean containment signed off, do **Option B** instead of
Option C. You lose nothing on the rubric and you keep your machine.

---

## Recommended stack for your project

```
Windows 11 eval VM      → Sysmon + PowerShell script block logging + Defender ON
Kali VM                 → Caldera server, Wireshark, nmap
Logging VM (optional)   → Wazuh, ingesting Sysmon from the target
Host-only network 10.10.10.0/24, snapshots before every run
Your analysis layer     → Sigma rules, Chainsaw/Hayabusa, ATT&CK Navigator layer
```

That is the whole build. Everything on it is open source, safe to publish, and
reproducible by whoever marks your work — which is worth more than any implant
you could write.

---

## The one-sentence version for your report

> The capability gap between a RAT and a commercial remote-management tool is
> small and mostly technical; the gap between an unauthorised intrusion and an
> authorised red-team engagement is large and entirely about consent, scope and
> containment. This project demonstrates the former while operating strictly
> within the latter, using purpose-built adversary-emulation tooling rather than
> live malware.
