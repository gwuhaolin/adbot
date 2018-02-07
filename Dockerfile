FROM centos7
#FROM mos-tensorflow1.1.0-cudnn5-cuda8.0-centos7
#for Centos

RUN curl --silent --location https://rpm.nodesource.com/setup_8.x | bash -
RUN yum -y install nodejs

RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_x86_64.rpm
RUN yum -y localinstall google-chrome-stable_current_x86_64.rpm

RUN git clone https://github.com/gwuhaolin/adbot.git
RUN cd adbot
RUN npm i
CMD [ "npm", "start" ]