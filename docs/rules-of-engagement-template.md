# Rules of Engagement — Coursework Adversary Emulation

> Template. Fill in every bracket, delete what does not apply, and get it signed
> **before** any tooling is run. Keep the signed copy in your report appendix.
> On a real engagement this document is what keeps people out of prison; treat
> it with the same seriousness in class.

---

## 1. Parties

| Role | Name | Contact |
|---|---|---|
| Requesting party (authorising) | [Instructor name / module lead] | [email, phone] |
| Engagement lead (student) | [Your name] | [email, phone] |
| Technical point of contact | [Name] | [email, phone] |
| Emergency stop contact (24h) | [Name] | [phone] |

## 2. Purpose

[One or two sentences. Example: "To demonstrate the Windows attacker kill chain
for the CY-4xx red team module, using adversary-emulation tooling against an
isolated lab environment owned by the student, in order to produce a written
analysis and a set of detection rules."]

## 3. Scope — in scope

| Asset | Owner | Address / identifier | Notes |
|---|---|---|---|
| Windows 11 eval VM (target) | [Your name] | 10.10.10.20 | Host-only network only |
| Kali VM (attacker/C2) | [Your name] | 10.10.10.10 | Host-only network only |
| [LOGGING VM] | [Your name] | 10.10.10.30 | Optional |

## 4. Scope — explicitly out of scope

- The university network, in whole or in part
- Any device not listed in §3, including personal phones and other students'
  laptops
- Any production, cloud, or third-party service
- Any account or credential not created solely for this lab
- Any system reachable only via the internet

## 5. Authorised activity

- [ ] Execution of emulation agents on in-scope hosts
- [ ] Local discovery (users, processes, network config, installed software)
- [ ] Credential access against lab-local throwaway accounts only
- [ ] Lateral movement between in-scope hosts
- [ ] Persistence mechanisms on in-scope hosts (documented and removed after)
- [ ] Log collection and analysis
- [ ] Journal / screenshot collection for the report

## 6. Prohibited activity

Non-negotiable, and to be stated in the report:

- No development or deployment of AV/EDR evasion, AMSI patching, unhooking,
  packing, or crypter techniques
- No self-propagating or worm-like behaviour
- No traffic to any host outside the isolated lab subnet
- No use of real, personal, or third-party credentials
- No denial-of-service or destructive testing (no encryption, deletion, or
  modification of data outside disposable snapshots)
- No testing on any system outside §3, under any circumstance, including
  "just to see if it works"
- No publication of live samples, binaries, or clickable malicious URLs

## 7. Timing

| | |
|---|---|
| Start | [date/time, timezone] |
| End | [date/time, timezone] |
| Permitted windows | [e.g. any time — lab is isolated] |
| Change freeze / blackout | [dates] |

## 8. Containment and safety controls

- Lab network: host-only / internal-only, isolated from the corporate and
  campus network; no bridged adapters
- Internet access from the target disabled during execution
- Clean snapshots taken before each run; rollback is the recovery procedure
- No shared folders or clipboard sharing between host and target
- Security tooling (Defender, EDR) left **enabled**; any detection is recorded
  as a finding, not disabled
- Kill switch: [how to stop everything immediately — e.g. power off VM, stop
  Caldera service]

## 9. Data handling

- Evidence stored locally, encrypted at rest where practical
- Published artefacts: defanged indicators only; no live binaries committed
- Retention: [e.g. destroyed on completion of grading]
- Disposal: VM snapshots containing implants destroyed on [date]; recorded in
  the report's artefact-disposal statement

## 10. Reporting

- Draft report to [instructor] by [date]
- Critical findings (e.g. an unexpected exposure beyond the lab) reported
  immediately, within [1 hour]
- Incident procedure if something escapes containment: stop all activity,
  contact the emergency stop contact, preserve logs, document

## 11. Legal acknowledgement

The engagement lead acknowledges that unauthorised access to computer systems is
a criminal offence — including under the Cybercrimes (Prohibition, Prevention,
etc.) Act 2015 (as amended) in Nigeria, the Computer Misuse Act 1990 in the UK,
and the Computer Fraud and Abuse Act in the US — and that all activity under
this engagement is confined to the assets in §3, within the window in §7.

## 12. Signatures

| Role | Name | Signature | Date |
|---|---|---|---|
| Authorising party | | | |
| Engagement lead | | | |
