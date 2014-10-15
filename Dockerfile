FROM resin/rpi-buildstep-armv6hf:production

RUN apt-get -q update && apt-get install -y openssh-server ntpdate && \
    mkdir /var/run/sshd && \
    echo 'root:letmein' | chpasswd && \
    sed -i 's/PermitRootLogin without-password/PermitRootLogin yes/' /etc/ssh/sshd_config && \
	wget -O- -q http://nodejs.org/dist/v0.10.22/node-v0.10.22-linux-arm-pi.tar.gz | tar xz -C / && \
	mv /node-v0.10.22-linux-arm-pi /nodejs && \
	chmod +x /nodejs/bin/*

RUN /nodejs/bin/npm install -g onoff firebase

RUN apt-get install -y fbi

ADD . /app

ADD start.sh /start
