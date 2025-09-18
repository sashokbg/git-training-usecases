FROM debian:trixie-slim

RUN apt-get update
RUN apt-get install -y git wget vim zsh nano git-filter-repo openssl curl openssh-client sudo shellinabox && \
    rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/* && \
    ln -sf '/etc/shellinabox/options-enabled/00+Black on White.css' \
      /etc/shellinabox/options-enabled/00+Black-on-White.css && \
    ln -sf '/etc/shellinabox/options-enabled/00_White On Black.css' \
      /etc/shellinabox/options-enabled/00_White-On-Black.css && \
    ln -sf '/etc/shellinabox/options-enabled/01+Color Terminal.css' \
      /etc/shellinabox/options-enabled/01+Color-Terminal.css

EXPOSE 4200

VOLUME /etc/shellinabox /var/log/supervisor /home

RUN wget https://github.com/robbyrussell/oh-my-zsh/raw/master/tools/install.sh -O - | zsh || true
RUN echo "learn-git-machine" > /etc/hostname

WORKDIR /git

COPY scripts/*.sh /git/
COPY docker/entrypoint.sh /entrypoint.sh

COPY docker/home/* /files/

ENTRYPOINT ["/bin/bash", "/entrypoint.sh"]
