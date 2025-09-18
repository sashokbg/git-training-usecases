#!/bin/bash

set -e

hex()
{
	openssl rand -hex 8
}

sudo="-G sudo"

groupadd learn-git -g 1000
useradd -u 1000 -g 1000 -s /bin/zsh -d /home/learn-git -m -G sudo learn-git
echo "learn-git:learn-git" | /usr/sbin/chpasswd

chown -R 1000:1000 /git /home/learn-git
cp -R /files/* /files/.* /home/learn-git

/usr/bin/shellinaboxd \
  --debug \
  --no-beep \
  --disable-peer-check \
  -u shellinabox \
  -g shellinabox \
  -c /var/lib/shellinabox \
  -p 4200 \
  --user-css "Normal:+/etc/shellinabox/options-enabled/00+Black-on-White.css,Reverse:-/etc/shellinabox/options-enabled/00_White-On-Black.css;Colors:+/etc/shellinabox/options-enabled/01+Color-Terminal.css,Monochrome:-/etc/shellinabox/options-enabled/01_Monochrome.css" \
  --css /home/learn-git/style.css \
  -m http://localhost:5173 \
  -t \
  -s /admin:AUTH:/:/bin/zsh \
  -s /:AUTH:/git:/bin/zsh

if [ "$@" = "shellinabox" ]; then
	echo "Executing: ${COMMAND}"
	exec ${COMMAND}
else
	echo "Not executing: ${COMMAND}"
	echo "Executing: ${@}"
	exec $@
fi
