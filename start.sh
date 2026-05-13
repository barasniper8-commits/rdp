#!/bin/bash

TAILSCALE_AUTH_KEY="tskey-auth-k8JCrFbY1T11CNTRL-NiYDjq9ACs3cuZdVLbZus3Zw29Ko61jk"

/usr/sbin/sshd

mkdir -p /var/run/dbus /var/lib/tailscale /var/run/tailscale
dbus-uuidgen > /var/lib/dbus/machine-id 2>/dev/null
dbus-daemon --system --fork

tailscaled --tun=userspace-networking \
           --state=/var/lib/tailscale/tailscaled.state \
           --socket=/var/run/tailscale/tailscaled.sock &
sleep 5

if ! pgrep -x tailscaled > /dev/null; then
    tailscaled --state=/var/lib/tailscale/tailscaled.state \
               --socket=/var/run/tailscale/tailscaled.sock &
    sleep 5
fi

TS_IP="NOT CONNECTED"
if pgrep -x tailscaled > /dev/null; then
    tailscale --socket=/var/run/tailscale/tailscaled.sock up \
        --authkey="$TAILSCALE_AUTH_KEY" \
        --hostname=rdp \
        --accept-dns=false
    TS_IP=$(tailscale --socket=/var/run/tailscale/tailscaled.sock ip -4)
fi

mkdir -p /var/run/xrdp
chmod 755 /var/run/xrdp
/usr/sbin/xrdp-sesman --nodaemon &
sleep 2
/usr/sbin/xrdp --nodaemon &

echo ""
echo "======================="
echo " RDP VPS ACTIVE"
echo "======================="
echo " User       : root"
echo " Password   : 2010"
echo " Tailscale  : $TS_IP"
echo " RDP        : $TS_IP:3389"
echo " SSH        : ssh root@$TS_IP"
echo " Node.js    : $(node -v)"
echo " npm        : $(npm -v)"
echo " Python     : $(python3 --version)"
echo "======================="
echo " RDP client: $TS_IP (port 3389)"

while true; do
    sleep 3600
done
