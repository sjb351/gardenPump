FROM python:3.10
RUN apt-get update 
RUN apt-get install -y udev
COPY ./requirements.txt /
RUN pip install -r requirements.txt
WORKDIR /app
ADD ./code/ /app/

