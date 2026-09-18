# ZAP evidence

Run `bash security/zap/run-zap.sh` against an authorized test deployment. The
script creates `zap-report.html`, `zap-report.json`, and `zap-report.md` here.

After the first scan, document each finding, affected route, severity, decision,
correction, and verification. Rerun ZAP after remediation and keep the final raw
reports from that run. Include the target environment, ZAP image version, date,
and source commit. This README by itself is not scan evidence.

