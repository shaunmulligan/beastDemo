#!/bin/bash

udevd --daemon
modprobe spi-bcm2708
modprobe fbtft_device name=pitft verbose=0 rotate=270

/usr/sbin/sshd

export HOME=/root

mkdir /app/node_modules
mv /nodejs/lib/node_modules/onoff /app/node_modules
mv /nodejs/lib/node_modules/firebase /app/node_modules

ntpdate stratum2.ord2.publicntp.net

/nodejs/bin/node /app/index.js &

while true; do
	ntpdate stratum2.ord2.publicntp.net
	sleep 60
done
