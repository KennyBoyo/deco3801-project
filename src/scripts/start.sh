#!/bin/bash

yum update -yum
amazon-linux-extras install -y docker
sudo service docker start
sudo usermod -a -G docker ec2-user
docker pull mediawiki:latest
docker run --name mediawiki -p 80:80 -d mediawiki