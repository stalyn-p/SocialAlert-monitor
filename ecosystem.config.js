module.exports = {
  apps : [
    {
      name: "CEREBRO-API",
      script: "/opt/social-monitor/venv/bin/python3",
      args: "-m uvicorn api:app --host 0.0.0.0 --port 8000",
      cwd: "/opt/social-monitor",
      autorestart: true,
    },
    {
      name: "TIKTOK-INTEL",
      script: "/opt/social-monitor/venv/bin/python3",
      args: "-m uvicorn tiktok_server:app --host 0.0.0.0 --port 8001",
      cwd: "/opt/social-monitor",
      autorestart: true,
    },
    {
      name: "TWITTER-INTEL",
      script: "/opt/social-monitor/venv/bin/python3",
      args: "-m uvicorn twitter_server:app --host 0.0.0.0 --port 8002",
      cwd: "/opt/social-monitor",
      autorestart: true,
    },
    {
      name: "FACEBOOK-INTEL",
      script: "/opt/social-monitor/venv/bin/python3",
      args: "-m uvicorn facebook_server:app --host 0.0.0.0 --port 8003",
      cwd: "/opt/social-monitor",
      autorestart: true,
    },
    {
      name: "INSTAGRAM-INTEL",
      script: "/opt/social-monitor/venv/bin/python3",
      args: "-m uvicorn instagram_server:app --host 0.0.0.0 --port 8004",
      cwd: "/opt/social-monitor",
      autorestart: true,
    },
    {
      name: "ESPIA-MONITOR",
      script: "/opt/social-monitor/venv/bin/python3",
      args: "monitor.py",
      cwd: "/opt/social-monitor",
      autorestart: true,
    },
    {
      name: "DASHBOARD-WEB",
      script: "npm",
      args: "run dev -- -p 3000 --hostname 0.0.0.0",
      cwd: "/opt/social-monitor/frontend",
      autorestart: true,
    }
  ]
};
