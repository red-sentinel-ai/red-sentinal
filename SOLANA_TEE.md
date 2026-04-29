1. First build a release for nautilus server

```bash
cd src/nautilus-server
```

```bash
cargo build --release
```

2. Solana TEE daemon service exists at `/etc/systemd/system/solanatee.service`
3. If for some reason service is deleted, you can create new file at the same path using `scripts/solanatee.service`
4. Check status of service
```bash
sudo systemctl status solanatee
```
5. Restart service
```bash
sudo systemctl restart solanatee
```
6. Restart service
```bash
sudo systemctl start solanatee
```
7. Reload All daemon
```bash
sudo systemctl daemon-reload
```
8. Enable auto restart on reboot
```bash
sudo systemctl enable solanatee
```

## NGINX Configuration

nginx files are located at 

```
/etc/nginx/sites-enabled/tee-solana.suisentinel.xyz
```

## TEE URL
Solana TEE URL
```
http://3.213.0.115:3013/health_check
```
```
https://tee-solana.suisentinel.xyz/health_check
```



