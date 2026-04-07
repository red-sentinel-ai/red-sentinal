module.exports = {
  apps: [
    {
      name: "nautilus-server",
      script: "./target/release/nautilus-server",
      cwd: "/Users/satyam/web3/sui/sui-sentinel/nautilus/src/nautilus-server",
      env: {
        PORT: "3013",
        RUST_LOG: "info",
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time: true,
    },
  ],
};
